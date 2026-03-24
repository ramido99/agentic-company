import { prisma } from "@/lib/db/prisma";
import { resolveWorkspaceId } from "@/lib/store";
import { getSkillById, getSkillsByRole, type AgentRoleType } from "@/lib/mock/skill-catalog";

export const agentSkillRepository = {
  /** 특정 에이전트에 배정된 스킬 ID 목록 조회 */
  async listSkillIdsForAgent(agentId: string): Promise<string[]> {
    const workspaceId = await resolveWorkspaceId();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const assignments = await (prisma as any).agentSkillAssignment.findMany({
      where: { workspaceId, agentId },
      orderBy: { createdAt: "asc" },
    }) as Array<{ skillId: string }>;
    return assignments.map((a) => a.skillId);
  },

  /** 특정 에이전트에 배정된 스킬 상세 목록 조회 */
  async listSkillsForAgent(agentId: string) {
    const skillIds = await this.listSkillIdsForAgent(agentId);
    return skillIds.map((id) => getSkillById(id)).filter(Boolean);
  },

  /** 역할(role)에 배정 가능한 스킬 목록 (호환 여부 포함) */
  async listCompatibleSkillsForRole(agentId: string, role: AgentRoleType) {
    const workspaceId = await resolveWorkspaceId();
    const compatible = getSkillsByRole(role);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const assignments = await (prisma as any).agentSkillAssignment.findMany({
      where: { workspaceId, agentId },
    }) as Array<{ skillId: string }>;
    const assignedSet = new Set(assignments.map((a) => a.skillId));

    return compatible.map((skill) => ({
      ...skill,
      assigned: assignedSet.has(skill.id),
    }));
  },

  /** 스킬 배정 */
  async assignSkill(agentId: string, skillId: string): Promise<void> {
    const workspaceId = await resolveWorkspaceId();

    // 스킬이 존재하는지 검증
    const skill = getSkillById(skillId);
    if (!skill) throw new Error(`스킬을 찾을 수 없습니다: ${skillId}`);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (prisma as any).agentSkillAssignment.upsert({
      where: {
        workspaceId_agentId_skillId: { workspaceId, agentId, skillId },
      },
      create: { workspaceId, agentId, skillId },
      update: {}, // 이미 존재하면 그대로
    });
  },

  /** 스킬 해제 */
  async unassignSkill(agentId: string, skillId: string): Promise<void> {
    const workspaceId = await resolveWorkspaceId();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (prisma as any).agentSkillAssignment.deleteMany({
      where: { workspaceId, agentId, skillId },
    });
  },

  /** runWorkflow에서 사용: 에이전트의 promptBoost 문자열들을 반환 */
  async getPromptBoostsForAgent(agentId: string): Promise<string[]> {
    const skills = await this.listSkillsForAgent(agentId);
    return skills
      .filter((s) => s !== undefined)
      .map((s) => s!.promptBoost)
      .filter(Boolean);
  },

  /** 출력 포맷(pptx/xlsx/pdf) 스킬이 배정되어 있는지 확인 */
  async getOutputFormatsForAgent(agentId: string) {
    const skills = await this.listSkillsForAgent(agentId);
    return skills
      .filter((s) => s !== undefined && s!.outputFormat !== undefined)
      .map((s) => s!.outputFormat!);
  },
};
