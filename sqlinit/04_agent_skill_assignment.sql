-- =============================================================================
-- 04_agent_skill_assignment.sql
-- AgentSkillAssignment 테이블 — Prisma 스키마에 포함되어 있으나
-- 기존 DB에 수동으로 추가해야 할 경우 사용
-- =============================================================================

CREATE TABLE IF NOT EXISTS "AgentSkillAssignment" (
  "id"          TEXT         NOT NULL DEFAULT gen_random_uuid()::text,
  "workspaceId" TEXT         NOT NULL,
  "agentId"     TEXT         NOT NULL,  -- agent-catalog ID (예: "strategist-core")
  "skillId"     TEXT         NOT NULL,  -- skill-catalog ID (예: "skill-market-analysis")
  "createdAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "AgentSkillAssignment_pkey"
    PRIMARY KEY ("id"),

  CONSTRAINT "AgentSkillAssignment_workspaceId_agentId_skillId_key"
    UNIQUE ("workspaceId", "agentId", "skillId"),

  CONSTRAINT "AgentSkillAssignment_workspaceId_fkey"
    FOREIGN KEY ("workspaceId")
    REFERENCES "Workspace"("id")
    ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS "AgentSkillAssignment_workspaceId_agentId_idx"
  ON "AgentSkillAssignment"("workspaceId", "agentId");
