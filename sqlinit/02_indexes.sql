-- =============================================================================
-- 02_indexes.sql — 성능 최적화 인덱스
-- 01_schema.sql 실행 후 적용
-- =============================================================================

-- ─── Membership ───────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS "Membership_workspaceId_idx"
  ON "Membership"("workspaceId");

-- ─── Company ──────────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS "Company_workspaceId_idx"
  ON "Company"("workspaceId");

-- ─── Goal ─────────────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS "Goal_workspaceId_idx"
  ON "Goal"("workspaceId");

CREATE INDEX IF NOT EXISTS "Goal_companyId_idx"
  ON "Goal"("companyId");

-- ─── WorkflowRun ──────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS "WorkflowRun_workspaceId_idx"
  ON "WorkflowRun"("workspaceId");

CREATE INDEX IF NOT EXISTS "WorkflowRun_companyId_idx"
  ON "WorkflowRun"("companyId");

CREATE INDEX IF NOT EXISTS "WorkflowRun_goalId_idx"
  ON "WorkflowRun"("goalId");

CREATE INDEX IF NOT EXISTS "WorkflowRun_status_idx"
  ON "WorkflowRun"("status");

CREATE INDEX IF NOT EXISTS "WorkflowRun_createdAt_idx"
  ON "WorkflowRun"("createdAt" DESC);

-- ─── Artifact ─────────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS "Artifact_workflowRunId_idx"
  ON "Artifact"("workflowRunId");

-- ─── AgentSkillAssignment ─────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS "AgentSkillAssignment_workspaceId_agentId_idx"
  ON "AgentSkillAssignment"("workspaceId", "agentId");

-- ─── UsageRecord ──────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS "UsageRecord_workspaceId_idx"
  ON "UsageRecord"("workspaceId");

CREATE INDEX IF NOT EXISTS "UsageRecord_userId_idx"
  ON "UsageRecord"("userId");

CREATE INDEX IF NOT EXISTS "UsageRecord_workflowRunId_idx"
  ON "UsageRecord"("workflowRunId");

-- ─── Subscription ─────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS "Subscription_workspaceId_idx"
  ON "Subscription"("workspaceId");
