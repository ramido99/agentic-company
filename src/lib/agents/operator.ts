import {
  createArtifactExecutor,
  type AgentExecutionContext,
  type AssignedAgentInfo,
} from "@/lib/agents/types";
import {
  generateOperatorPlanWithLLM,
  generateOperatorChecklistWithLLM,
} from "@/lib/llm/openai-client";
import { usageRecordRepository } from "@/lib/repositories/usage-record-repository";
import { Artifact } from "@/lib/types";

export type OperatorPlanInput = AgentExecutionContext & {
  brief: Artifact;
  assignedAgent?: AssignedAgentInfo;
};

export type OperatorChecklistInput = AgentExecutionContext & {
  plan: Artifact;
  assignedAgent?: AssignedAgentInfo;
};

function buildExecutionPlanArtifact({ runId, brief, createdAt, assignedAgent }: OperatorPlanInput): Artifact {
  return {
    id: `${runId}_plan`,
    runId,
    role: "operator",
    type: "execution-plan",
    title: assignedAgent ? `${assignedAgent.agentName} 실행 계획` : "실행 계획",
    summary: "배정된 실행 담당이 브리프를 실제 실행 순서로 바꾼 계획입니다.",
    content: [
      `담당 실행 담당: ${assignedAgent?.agentName ?? "실행 담당"}.`,
      `기준 문장: ${brief.content[1]}`,
      "1단계: 제안 가치, 핵심 고객, 신뢰 포인트를 정리합니다.",
      "2단계: 랜딩 페이지 구조와 첫 제안 메시지를 작성합니다.",
      "3단계: 이번 주 안에 실행할 가장 작은 행동 단위를 결정합니다.",
    ],
    status: "ready",
    createdAt,
  };
}

function buildChecklistArtifact({ runId, plan, createdAt, assignedAgent }: OperatorChecklistInput): Artifact {
  return {
    id: `${runId}_checklist`,
    runId,
    role: "operator",
    type: "checklist",
    title: assignedAgent ? `${assignedAgent.agentName} 체크리스트` : "체크리스트",
    summary: "배정된 실행 담당이 바로 움직일 수 있는 작업 목록으로 바꿉니다.",
    content: [
      `담당 실행 담당: ${assignedAgent?.agentName ?? "실행 담당"}.`,
      "포지셔닝 문장을 한 줄로 정리합니다.",
      "고객 인터뷰 또는 검증 질문 3개를 준비합니다.",
      "헤드라인, 신뢰 요소, 행동 유도를 포함한 랜딩 페이지 개요를 작성합니다.",
      `${plan.title} 내용을 기준으로 빠진 항목이 없는지 확인합니다.`,
    ],
    status: "ready",
    createdAt,
  };
}

export const operatorPlanAgent = createArtifactExecutor<OperatorPlanInput>("operator", async (input) => {
  try {
    const llmResult = await generateOperatorPlanWithLLM({
      briefTitle: input.brief.title,
      briefContent: Array.isArray(input.brief.content) ? input.brief.content as string[] : [],
      agentName: input.assignedAgent?.agentName,
      agentHeadline: input.assignedAgent?.agentHeadline,
      skillBoosts: input.skillBoosts,
    }, input.llmOptions);

    await usageRecordRepository.create({
      workflowRunId: input.runId,
      metric: "operator_plan_tokens_total",
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
      id: `${input.runId}_plan`,
      runId: input.runId,
      role: "operator",
      type: "execution-plan",
      title: input.assignedAgent ? `${input.assignedAgent.agentName} 실행 계획` : llmResult.title,
      summary: llmResult.summary,
      content: llmResult.content,
      status: "ready",
      createdAt: input.createdAt,
    };
  } catch (error) {
    await usageRecordRepository.create({
      workflowRunId: input.runId,
      metric: "operator_plan_fallback",
      value: 1,
      metadata: { status: "fallback", reason: error instanceof Error ? error.message : "Unknown" },
    });
    return buildExecutionPlanArtifact(input);
  }
});

export const operatorChecklistAgent = createArtifactExecutor<OperatorChecklistInput>("operator", async (input) => {
  try {
    const llmResult = await generateOperatorChecklistWithLLM({
      planTitle: input.plan.title,
      planContent: Array.isArray(input.plan.content) ? input.plan.content as string[] : [],
      agentName: input.assignedAgent?.agentName,
      skillBoosts: input.skillBoosts,
    }, input.llmOptions);

    await usageRecordRepository.create({
      workflowRunId: input.runId,
      metric: "operator_checklist_tokens_total",
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
      id: `${input.runId}_checklist`,
      runId: input.runId,
      role: "operator",
      type: "checklist",
      title: input.assignedAgent ? `${input.assignedAgent.agentName} 체크리스트` : llmResult.title,
      summary: llmResult.summary,
      content: llmResult.content,
      status: "ready",
      createdAt: input.createdAt,
    };
  } catch (error) {
    await usageRecordRepository.create({
      workflowRunId: input.runId,
      metric: "operator_checklist_fallback",
      value: 1,
      metadata: { status: "fallback", reason: error instanceof Error ? error.message : "Unknown" },
    });
    return buildChecklistArtifact(input);
  }
});

export async function operatorPlan(input: OperatorPlanInput): Promise<Artifact> {
  return operatorPlanAgent.execute(input);
}

export async function operatorChecklist(input: OperatorChecklistInput): Promise<Artifact> {
  return operatorChecklistAgent.execute(input);
}
