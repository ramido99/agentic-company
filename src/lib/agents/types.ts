import { AgentRole, Artifact } from "@/lib/types";
import type { LLMClientOptions } from "@/lib/llm/openai-client";

export interface AgentExecutionContext {
  runId: string;
  createdAt: string;
  /** 배정된 스킬의 promptBoost 목록 — 에이전트 프롬프트에 주입됨 */
  skillBoosts?: string[];
  /** 사용자가 설정에서 등록한 LLM API 옵션 (없으면 env var 사용) */
  llmOptions?: LLMClientOptions;
}

export interface AssignedAgentInfo {
  role: AgentRole;
  agentId: string;
  agentName: string;
  agentHeadline: string;
}

export interface AgentExecutor<TInput> {
  role: AgentRole;
  execute(input: TInput): Promise<Artifact>;
}

export function createArtifactExecutor<TInput>(
  role: AgentRole,
  execute: (input: TInput) => Artifact | Promise<Artifact>,
): AgentExecutor<TInput> {
  return {
    role,
    async execute(input) {
      return execute(input);
    },
  };
}
