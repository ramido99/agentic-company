import {
  createArtifactExecutor,
  type AgentExecutionContext,
  type AssignedAgentInfo,
} from "@/lib/agents/types";
import { generateStrategistBriefWithLLM } from "@/lib/llm/openai-client";
import { usageRecordRepository } from "@/lib/repositories/usage-record-repository";
import { Artifact, Company, Goal } from "@/lib/types";

export type StrategistInput = AgentExecutionContext & {
  company: Company;
  goal: Goal;
  assignedAgent?: AssignedAgentInfo;
  searchResults?: string; // 실시간 웹 검색 결과 (Tavily)
  // skillBoosts is inherited from AgentExecutionContext
};

function buildBriefArtifact({
  runId,
  company,
  goal,
  createdAt,
  assignedAgent,
}: StrategistInput): Artifact {
  const normalizedTask = goal.task.trim().replace(/[.!?]+$/, "");

  return {
    id: `${runId}_brief`,
    runId,
    role: "strategist",
    type: "brief",
    title: "브리프",
    summary: "배정된 전략가가 이번 실행의 방향과 기대 결과를 빠르게 정리한 요약입니다.",
    content: [
      `담당 전략가: ${assignedAgent?.agentName ?? "전략가"}.`,
      `회사 맥락: ${company.name}는 ${company.idea}를 추진하고 있습니다.`,
      `목표: ${goal.title}.`,
      `작업 정의: ${normalizedTask}.`,
      "성공 기준: 실행 계획, 체크리스트, 리뷰까지 바로 이어질 수 있어야 합니다.",
    ],
    status: "ready",
    createdAt,
  };
}

export const strategistAgent = createArtifactExecutor<StrategistInput>("strategist", async (input) => {
  try {
    const llmResult = await generateStrategistBriefWithLLM({
      companyName: input.company.name,
      companyIdea: input.company.idea,
      goalTitle: input.goal.title,
      task: input.goal.task,
      agentName: input.assignedAgent?.agentName,
      agentHeadline: input.assignedAgent?.agentHeadline,
      skillBoosts: input.skillBoosts,
      searchResults: input.searchResults,
    }, input.llmOptions);

    await usageRecordRepository.create({
      workflowRunId: input.runId,
      metric: "strategist_tokens_total",
      value: llmResult.usage.totalTokens,
      metadata: {
        provider: llmResult.usage.provider,
        model: llmResult.usage.model,
        inputTokens: llmResult.usage.inputTokens,
        outputTokens: llmResult.usage.outputTokens,
        responseId: llmResult.usage.responseId,
        status: "success",
      },
    });

    return {
      id: `${input.runId}_brief`,
      runId: input.runId,
      role: "strategist",
      type: "brief",
      title: input.assignedAgent ? `${input.assignedAgent.agentName} 브리프` : llmResult.title,
      summary: llmResult.summary,
      content: input.assignedAgent
        ? [`담당 전략가: ${input.assignedAgent.agentName}.`, ...llmResult.content]
        : llmResult.content,
      status: "ready",
      createdAt: input.createdAt,
    };
  } catch (error) {
    const fallbackArtifact = buildBriefArtifact(input);

    await usageRecordRepository.create({
      workflowRunId: input.runId,
      metric: "strategist_fallback",
      value: 1,
      metadata: {
        status: "fallback",
        reason: error instanceof Error ? error.message : "Unknown LLM error",
      },
    });

    // Keep the workflow stable even if the LLM is unavailable.
    return fallbackArtifact;
  }
});

export async function strategist(input: StrategistInput): Promise<Artifact> {
  return strategistAgent.execute(input);
}
