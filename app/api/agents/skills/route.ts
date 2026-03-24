/**
 * GET  /api/agents/skills?agentId=xxx&role=xxx
 *   - 에이전트에 호환 가능한 스킬 목록 + 배정 여부
 *
 * POST /api/agents/skills  { agentId, skillId }
 *   - 스킬 배정
 *
 * DELETE /api/agents/skills  { agentId, skillId }
 *   - 스킬 해제
 */
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/config";
import { agentSkillRepository } from "@/lib/repositories/agent-skill-repository";
import { type AgentRoleType } from "@/lib/mock/skill-catalog";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const agentId = searchParams.get("agentId");
  const role = searchParams.get("role") as AgentRoleType | null;

  if (!agentId || !role) {
    return Response.json({ error: "agentId와 role은 필수입니다." }, { status: 400 });
  }

  try {
    const skills = await agentSkillRepository.listCompatibleSkillsForRole(agentId, role);
    return Response.json({ skills });
  } catch (error) {
    console.error("[GET /api/agents/skills]", error);
    return Response.json({ error: "스킬 조회 실패" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { agentId?: string; skillId?: string };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { agentId, skillId } = body;
  if (!agentId || !skillId) {
    return Response.json({ error: "agentId와 skillId는 필수입니다." }, { status: 400 });
  }

  try {
    await agentSkillRepository.assignSkill(agentId, skillId);
    return Response.json({ success: true });
  } catch (error) {
    console.error("[POST /api/agents/skills]", error);
    return Response.json({ error: "스킬 배정 실패" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { agentId?: string; skillId?: string };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { agentId, skillId } = body;
  if (!agentId || !skillId) {
    return Response.json({ error: "agentId와 skillId는 필수입니다." }, { status: 400 });
  }

  try {
    await agentSkillRepository.unassignSkill(agentId, skillId);
    return Response.json({ success: true });
  } catch (error) {
    console.error("[DELETE /api/agents/skills]", error);
    return Response.json({ error: "스킬 해제 실패" }, { status: 500 });
  }
}
