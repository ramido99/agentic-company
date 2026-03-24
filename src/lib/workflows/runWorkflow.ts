import { AgentRole as PrismaAgentRole, ArtifactStatus, ArtifactType, WorkflowRunStatus } from "@prisma/client";

import { operatorChecklist, operatorPlan } from "@/lib/agents/operator";
import { reviewer } from "@/lib/agents/reviewer";
import { strategist } from "@/lib/agents/strategist";
import { agentHiringRepository } from "@/lib/repositories/agent-hiring-repository";
import { agentSkillRepository } from "@/lib/repositories/agent-skill-repository";
import { artifactRepository } from "@/lib/repositories/artifact-repository";
import { workflowRunRepository } from "@/lib/repositories/workflow-run-repository";
import { getCompany, getGoal } from "@/lib/store";
import {
  uploadWorkflowResult,
  uploadWorkflowResultBuffer,
} from "@/lib/storage/supabase-storage";
import { buildWorkflowExportMarkdown, buildResearchMarkdown } from "@/lib/workflows/exportArtifacts";
import { generatePptxBuffer } from "@/lib/workflows/generatePptx";
import { generateXlsxBuffer } from "@/lib/workflows/generateXlsx";
import { generatePdfBuffer } from "@/lib/workflows/generatePdf";
import { Artifact } from "@/lib/types";
import { formatSearchResultsForPrompt, searchWeb } from "@/lib/search/tavily";
import { aiProviderSettingRepository } from "@/lib/repositories/ai-provider-setting-repository";
import {
  generateResearchSynthesisWithLLM,
  type LLMClientOptions,
  type ResearchSynthesisResult,
} from "@/lib/llm/openai-client";

// Map internal artifact type strings → Prisma enum
const ARTIFACT_TYPE_MAP: Record<string, ArtifactType> = {
  "brief": ArtifactType.BRIEF,
  "execution-plan": ArtifactType.EXECUTION_PLAN,
  "checklist": ArtifactType.CHECKLIST,
  "review": ArtifactType.REVIEW,
};

const AGENT_ROLE_MAP: Record<string, PrismaAgentRole> = {
  "strategist": PrismaAgentRole.STRATEGIST,
  "operator": PrismaAgentRole.OPERATOR,
  "reviewer": PrismaAgentRole.REVIEWER,
};

export async function runWorkflow(goalId: string, userId?: string) {
  const goal = await getGoal(goalId);
  if (!goal) throw new Error("목표를 찾을 수 없습니다.");

  const company = await getCompany(goal.companyId);
  if (!company) throw new Error("회사를 찾을 수 없습니다.");

  // Resolve active agents from catalog
  const [strategistAgents, operatorAgents, reviewerAgents] = await Promise.all([
    agentHiringRepository.listAssignableAgentsByRole("strategist"),
    agentHiringRepository.listAssignableAgentsByRole("operator"),
    agentHiringRepository.listAssignableAgentsByRole("reviewer"),
  ]);

  const assignedStrategist = strategistAgents[0];
  const assignedOperator = operatorAgents[0];
  const assignedReviewer = reviewerAgents[0];

  // 각 에이전트의 스킬 promptBoost와 outputFormat 로드
  const [
    strategistBoosts,
    operatorBoosts,
    reviewerBoosts,
    operatorOutputFormats,
    reviewerOutputFormats,
  ] = await Promise.all([
    assignedStrategist
      ? agentSkillRepository.getPromptBoostsForAgent(assignedStrategist.id)
      : Promise.resolve([] as string[]),
    assignedOperator
      ? agentSkillRepository.getPromptBoostsForAgent(assignedOperator.id)
      : Promise.resolve([] as string[]),
    assignedReviewer
      ? agentSkillRepository.getPromptBoostsForAgent(assignedReviewer.id)
      : Promise.resolve([] as string[]),
    assignedOperator
      ? agentSkillRepository.getOutputFormatsForAgent(assignedOperator.id)
      : Promise.resolve([] as string[]),
    assignedReviewer
      ? agentSkillRepository.getOutputFormatsForAgent(assignedReviewer.id)
      : Promise.resolve([] as string[]),
  ]);

  // 모든 출력 포맷 중복 제거
  const allOutputFormats = [
    ...new Set([...operatorOutputFormats, ...reviewerOutputFormats]),
  ] as ("pptx" | "xlsx" | "pdf")[];

  // Create the run in DB — inherit workspaceId from the goal
  const run = await workflowRunRepository.create({
    workspaceId: goal.workspaceId,
    companyId: company.id,
    goalId: goal.id,
    task: goal.task,
    status: WorkflowRunStatus.RUNNING,
  });

  const runId = run.id;
  const createdAt = run.createdAt.toISOString();

  // 사용자가 설정에서 등록한 LLM API 키 로드 (없으면 env var 사용)
  let llmOptions: LLMClientOptions | undefined;
  if (userId) {
    const setting = await aiProviderSettingRepository.findByUserId(userId);
    if (setting?.isActive && setting.apiKeyEncrypted) {
      // base64 디코딩으로 실제 키 복원
      const apiKey = Buffer.from(setting.apiKeyEncrypted, "base64").toString("utf-8");
      llmOptions = {
        apiKey,
        apiEndpoint: setting.apiEndpoint || undefined,
        model: setting.defaultModel || undefined,
      };
      console.log(`[runWorkflow] 사용자 LLM 설정 로드: provider=${setting.provider}, model=${setting.defaultModel}`);
    }
  }

  const executionContext = { runId, createdAt, llmOptions };

  try {
    // ── 1단계: 웹 검색 ──────────────────────────────────
    const searchQuery = `${goal.title} ${goal.task}`.trim();
    const rawSearchResults = await searchWeb(searchQuery, 7);
    const searchResultsText = formatSearchResultsForPrompt(rawSearchResults) || undefined;

    if (searchResultsText) {
      console.log(`[runWorkflow] 검색 완료: "${searchQuery}" — ${rawSearchResults?.results.length ?? 0}건`);
    }

    // ── 2단계: 연구 합성 (검색 결과 → 섹션별 구조화) ──
    let researchSynthesis: ResearchSynthesisResult | undefined;
    if (rawSearchResults && searchResultsText) {
      try {
        const synthesis = await generateResearchSynthesisWithLLM({
          query: searchQuery,
          goalTitle: goal.title,
          task: goal.task,
          companyName: company.name,
          rawSearchText: searchResultsText,
        }, llmOptions);
        researchSynthesis = synthesis ?? undefined;
        console.log(`[runWorkflow] 연구 합성 완료: ${researchSynthesis?.sections.length ?? 0}개 섹션`);
      } catch (e) {
        console.warn("[runWorkflow] 연구 합성 실패 (계속 진행):", e);
      }
    }

    // Run agents sequentially — deterministic order
    const brief = await strategist({
      ...executionContext,
      company: { ...company, createdAt: company.createdAt instanceof Date ? company.createdAt.toISOString() : company.createdAt },
      goal: { ...goal, createdAt: goal.createdAt instanceof Date ? goal.createdAt.toISOString() : goal.createdAt },
      assignedAgent: assignedStrategist ? {
        role: "strategist",
        agentId: assignedStrategist.id,
        agentName: assignedStrategist.name,
        agentHeadline: assignedStrategist.headline,
      } : undefined,
      skillBoosts: strategistBoosts,
      searchResults: searchResultsText,
    });

    const executionPlan = await operatorPlan({
      ...executionContext,
      brief,
      assignedAgent: assignedOperator ? {
        role: "operator",
        agentId: assignedOperator.id,
        agentName: assignedOperator.name,
        agentHeadline: assignedOperator.headline,
      } : undefined,
      skillBoosts: operatorBoosts,
    });

    const checklist = await operatorChecklist({
      ...executionContext,
      plan: executionPlan,
      assignedAgent: assignedOperator ? {
        role: "operator",
        agentId: assignedOperator.id,
        agentName: assignedOperator.name,
        agentHeadline: assignedOperator.headline,
      } : undefined,
      skillBoosts: operatorBoosts,
    });

    const review = await reviewer({
      ...executionContext,
      brief,
      plan: executionPlan,
      checklist,
      assignedAgent: assignedReviewer ? {
        role: "reviewer",
        agentId: assignedReviewer.id,
        agentName: assignedReviewer.name,
        agentHeadline: assignedReviewer.headline,
      } : undefined,
      skillBoosts: reviewerBoosts,
    });

    const artifacts: Artifact[] = [brief, executionPlan, checklist, review];

    // Persist artifacts to DB
    await artifactRepository.createManyForWorkflowRun(
      artifacts.map((a, position) => ({
        workflowRunId: runId,
        role: AGENT_ROLE_MAP[a.role] ?? PrismaAgentRole.STRATEGIST,
        type: ARTIFACT_TYPE_MAP[a.type] ?? ArtifactType.BRIEF,
        title: a.title,
        summary: a.summary,
        content: a.content,
        status: ArtifactStatus.READY,
        position,
      })),
    );

    // Update run status to COMPLETED
    await workflowRunRepository.updateStatus(runId, WorkflowRunStatus.COMPLETED, new Date());

    const runForExport = { ...run, status: "COMPLETED", artifacts, completedAt: new Date() } as never;

    // ── 3단계: 연구 노트 MD 저장 (검색 결과 + 합성 내용) ──
    if (rawSearchResults && researchSynthesis) {
      try {
        const researchMd = buildResearchMarkdown(
          goal.title,
          company.name,
          searchQuery,
          rawSearchResults,
          researchSynthesis,
        );
        await uploadWorkflowResult({
          workspaceId: goal.workspaceId,
          runId,
          content: researchMd,
          filename: "research-notes.md",
        });
        console.log("[runWorkflow] research-notes.md 저장 완료");
      } catch (e) {
        console.warn("[runWorkflow] research-notes.md 저장 실패 (무시됨):", e);
      }
    }

    // ── 4단계: 워크플로우 요약 MD 저장 (에이전트 결과물) ──
    try {
      const markdownContent = buildWorkflowExportMarkdown(runForExport, company.name, goal.title);
      await uploadWorkflowResult({
        workspaceId: goal.workspaceId,
        runId,
        content: markdownContent,
        filename: "workflow-results.md",
      });
    } catch (storageError) {
      console.warn("[runWorkflow] workflow-results.md 업로드 실패:", storageError);
    }

    // ── 5단계: 포맷 파일 생성 (PPT엔 연구 내용 전달) ──────
    if (allOutputFormats.length > 0) {
      const uploadPromises = allOutputFormats.map(async (format) => {
        try {
          let buffer: Buffer;

          switch (format) {
            case "pptx":
              // 연구 합성 결과가 있으면 → 연구 보고서 PPT
              // 없으면 → 에이전트 artifact 기반 PPT
              buffer = await generatePptxBuffer(
                runForExport,
                company.name,
                goal.title,
                researchSynthesis,
              );
              break;
            case "xlsx":
              buffer = generateXlsxBuffer(runForExport, company.name, goal.title);
              break;
            case "pdf":
              buffer = generatePdfBuffer(runForExport, company.name, goal.title);
              break;
            default:
              return;
          }

          await uploadWorkflowResultBuffer({
            workspaceId: goal.workspaceId,
            runId,
            buffer,
            format,
          });

          console.log(`[runWorkflow] ${format.toUpperCase()} 업로드 완료`);
        } catch (formatError) {
          console.warn(`[runWorkflow] ${format} 생성/업로드 실패 (무시됨):`, formatError);
        }
      });

      await Promise.allSettled(uploadPromises);
    }

    return { ...run, status: "completed" as const, artifacts };
  } catch (error) {
    await workflowRunRepository.updateStatus(runId, WorkflowRunStatus.FAILED);
    throw error;
  }
}
