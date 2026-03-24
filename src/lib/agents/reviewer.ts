import {
  createArtifactExecutor,
  type AgentExecutionContext,
  type AssignedAgentInfo,
} from "@/lib/agents/types";
import { generateReviewerReviewWithLLM } from "@/lib/llm/openai-client";
import { usageRecordRepository } from "@/lib/repositories/usage-record-repository";
import { Artifact } from "@/lib/types";

export type ReviewerInput = AgentExecutionContext & {
  brief: Artifact;
  plan: Artifact;
  checklist: Artifact;
  assignedAgent?: AssignedAgentInfo;
};

function buildReviewArtifact({
  runId,
  brief,
  plan,
  checklist,
  createdAt,
  assignedAgent,
}: ReviewerInput): Artifact {
  return {
    id: `${runId}_review`,
    runId,
    role: "reviewer",
    type: "review",
    title: assignedAgent ? `${assignedAgent.agentName} 리뷰` : "리뷰",
    summary: "배정된 검토자가 이번 실행 결과의 완결성과 실행 가능성을 확인합니다.",
    content: [
      `담당 검토자: ${assignedAgent?.agentName ?? "검토자"}.`,
      `브리프 상태: ${brief.content.length >= 4 ? "핵심 정보가 충분합니다." : "정보가 더 필요합니다."}`,
      `실행 계획 상태: ${plan.content.length >= 3 ? "실행 가능한 수준입니다." : "조금 더 구체화가 필요합니다."}`,
      `체크리스트 상태: ${checklist.content.length >= 4 ? "바로 실행 가능한 수준입니다." : "작업 항목을 보강해야 합니다."}`,
      "권장 사항: 현재 구조는 데모에 적합하며, 이후 실제 AI 호출은 이 역할 경계 안에 연결하면 됩니다.",
    ],
    status: "approved",
    createdAt,
  };
}

export const reviewerAgent = createArtifactExecutor<ReviewerInput>("reviewer", async (input) => {
  try {
    const llmResult = await generateReviewerReviewWithLLM({
      briefTitle: input.brief.title,
      briefContent: Array.isArray(input.brief.content) ? input.brief.content as string[] : [],
      planTitle: input.plan.title,
      planContent: Array.isArray(input.plan.content) ? input.plan.content as string[] : [],
      checklistTitle: input.checklist.title,
      checklistContent: Array.isArray(input.checklist.content) ? input.checklist.content as string[] : [],
      agentName: input.assignedAgent?.agentName,
      agentHeadline: input.assignedAgent?.agentHeadline,
      skillBoosts: input.skillBoosts,
    }, input.llmOptions);

    await usageRecordRepository.create({
      workflowRunId: input.runId,
      metric: "reviewer_tokens_total",
      value: llmResult.usage.totalTokens,
      metadata: {
        provider: llmResult.usage.provider,
        model: llmResult.usage.model,
        inputTokens: llmResult.usage.inputTokens,
        outputTokens: llmResult.usage.outputTokens,
        status: "success",
      },
    });

    return {
      id: `${input.runId}_review`,
      runId: input.runId,
      role: "reviewer",
      type: "review",
      title: input.assignedAgent ? `${input.assignedAgent.agentName} 리뷰` : llmResult.title,
      summary: llmResult.summary,
      content: llmResult.content,
      status: "approved",
      createdAt: input.createdAt,
    };
  } catch (error) {
    await usageRecordRepository.create({
      workflowRunId: input.runId,
      metric: "reviewer_fallback",
      value: 1,
      metadata: { status: "fallback", reason: error instanceof Error ? error.message : "Unknown" },
    });
    return buildReviewArtifact(input);
  }
});

export async function reviewer(input: ReviewerInput): Promise<Artifact> {
  return reviewerAgent.execute(input);
}
