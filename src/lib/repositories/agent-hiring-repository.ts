import { agentCatalog, getAgentById, getAgentsForRole, type AgentCatalogItem } from "@/lib/mock/agent-catalog";
import { nowIso, readFileStore, writeFileStore } from "@/lib/repositories/file-store";
import { AgentRole } from "@/lib/types";

export type AgentCatalogView = AgentCatalogItem & {
  hired: boolean;
  active: boolean;
  assignedCompanyNames: string[];
};

function mergeAgentState(
  agent: AgentCatalogItem,
  stateAgentIds: Map<string, { active: boolean }>,
  assignedCompanyNames: string[],
): AgentCatalogView {
  const stored = stateAgentIds.get(agent.id);
  const hired = agent.builtIn ? true : Boolean(stored);
  const active = agent.builtIn ? stored?.active ?? true : stored?.active ?? false;

  return {
    ...agent,
    hired,
    active,
    assignedCompanyNames,
  };
}

export const agentHiringRepository = {
  async listCatalog(role?: AgentRole) {
    const state = await readFileStore();
    const stateMap = new Map(state.agentStates.map((item) => [item.agentId, { active: item.active }]));

    const catalog = role ? getAgentsForRole(role) : agentCatalog;

    return catalog.map((agent) => {
      const assignedCompanyNames = state.companies
        .filter((company) => company.agentAssignments.some((assignment) => assignment.agentId === agent.id))
        .map((company) => company.name);

      return mergeAgentState(agent, stateMap, assignedCompanyNames);
    });
  },

  async listMyAgents() {
    const catalog = await this.listCatalog();
    return catalog.filter((agent) => agent.hired);
  },

  async listAssignableAgentsByRole(role: AgentRole) {
    const catalog = await this.listCatalog(role);
    return catalog.filter((agent) => agent.hired && agent.active);
  },

  async findCatalogAgentById(agentId: string) {
    const catalog = await this.listCatalog();
    return catalog.find((agent) => agent.id === agentId);
  },

  async hire(agentId: string) {
    const baseAgent = getAgentById(agentId);
    if (!baseAgent) {
      throw new Error("에이전트를 찾을 수 없습니다.");
    }

    if (baseAgent.builtIn) {
      return this.findCatalogAgentById(agentId);
    }

    const state = await readFileStore();
    const existing = state.agentStates.find((item) => item.agentId === agentId);

    if (existing) {
      existing.active = true;
    } else {
      state.agentStates.push({
        agentId,
        active: true,
        hiredAt: nowIso(),
      });
    }

    await writeFileStore(state);
    return this.findCatalogAgentById(agentId);
  },

  async fire(agentId: string) {
    const baseAgent = getAgentById(agentId);
    if (!baseAgent) throw new Error("에이전트를 찾을 수 없습니다.");
    if (baseAgent.builtIn) throw new Error("기본 에이전트는 해제할 수 없습니다.");

    const state = await readFileStore();
    state.agentStates = state.agentStates.filter((item) => item.agentId !== agentId);
    await writeFileStore(state);
  },

  async setActive(agentId: string, active: boolean) {
    const baseAgent = getAgentById(agentId);

    if (!baseAgent) {
      throw new Error("에이전트를 찾을 수 없습니다.");
    }

    const state = await readFileStore();
    const existing = state.agentStates.find((item) => item.agentId === agentId);

    if (existing) {
      existing.active = active;
    } else {
      state.agentStates.push({
        agentId,
        active,
        hiredAt: nowIso(),
      });
    }

    await writeFileStore(state);
    return this.findCatalogAgentById(agentId);
  },
};
