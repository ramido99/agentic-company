-- AgentSkillAssignment 테이블 생성
-- Supabase SQL Editor에서 실행해주세요

CREATE TABLE IF NOT EXISTS "AgentSkillAssignment" (
  "id"          TEXT NOT NULL DEFAULT gen_random_uuid()::text,
  "workspaceId" TEXT NOT NULL,
  "agentId"     TEXT NOT NULL,
  "skillId"     TEXT NOT NULL,
  "createdAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "AgentSkillAssignment_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "AgentSkillAssignment_workspaceId_agentId_skillId_key"
    UNIQUE ("workspaceId", "agentId", "skillId"),
  CONSTRAINT "AgentSkillAssignment_workspaceId_fkey"
    FOREIGN KEY ("workspaceId")
    REFERENCES "Workspace"("id")
    ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS "AgentSkillAssignment_workspaceId_agentId_idx"
  ON "AgentSkillAssignment"("workspaceId", "agentId");
