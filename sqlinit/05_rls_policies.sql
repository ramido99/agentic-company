-- =============================================================================
-- 05_rls_policies.sql — Row Level Security (RLS) 정책 설정
--
-- Supabase는 기본적으로 RLS가 활성화됩니다.
-- 이 프로젝트는 API 레이어(Next.js)에서 모든 DB 접근을 처리하므로
-- 클라이언트의 직접 접근을 차단합니다.
-- =============================================================================

-- ─── RLS 활성화 ───────────────────────────────────────────────────────────────

ALTER TABLE "User"                   ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Account"                ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Session"                ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Workspace"              ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Membership"             ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Company"                ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Goal"                   ENABLE ROW LEVEL SECURITY;
ALTER TABLE "WorkflowRun"            ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Artifact"               ENABLE ROW LEVEL SECURITY;
ALTER TABLE "AgentSkillAssignment"   ENABLE ROW LEVEL SECURITY;
ALTER TABLE "UserAIProviderSetting"  ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Subscription"           ENABLE ROW LEVEL SECURITY;
ALTER TABLE "UsageRecord"            ENABLE ROW LEVEL SECURITY;

-- =============================================================================
-- ※ 이 앱은 Next.js API Routes에서 SUPABASE_SERVICE_ROLE_KEY를 사용합니다.
--    service_role은 RLS를 우회하므로 아래 정책은 클라이언트(브라우저)의
--    직접 Supabase 접근을 차단하는 보안 레이어입니다.
-- =============================================================================

-- ─── 클라이언트 직접 접근 전면 차단 ─────────────────────────────────────────
-- anon 및 authenticated 역할의 직접 쿼리를 모두 거부합니다.
-- 모든 데이터 접근은 서버(API Route)를 통해서만 허용됩니다.

-- User
CREATE POLICY "block_direct_access" ON "User"
  FOR ALL TO anon, authenticated USING (false);

-- Workspace
CREATE POLICY "block_direct_access" ON "Workspace"
  FOR ALL TO anon, authenticated USING (false);

-- Membership
CREATE POLICY "block_direct_access" ON "Membership"
  FOR ALL TO anon, authenticated USING (false);

-- Company
CREATE POLICY "block_direct_access" ON "Company"
  FOR ALL TO anon, authenticated USING (false);

-- Goal
CREATE POLICY "block_direct_access" ON "Goal"
  FOR ALL TO anon, authenticated USING (false);

-- WorkflowRun
CREATE POLICY "block_direct_access" ON "WorkflowRun"
  FOR ALL TO anon, authenticated USING (false);

-- Artifact
CREATE POLICY "block_direct_access" ON "Artifact"
  FOR ALL TO anon, authenticated USING (false);

-- AgentSkillAssignment
CREATE POLICY "block_direct_access" ON "AgentSkillAssignment"
  FOR ALL TO anon, authenticated USING (false);

-- UserAIProviderSetting
CREATE POLICY "block_direct_access" ON "UserAIProviderSetting"
  FOR ALL TO anon, authenticated USING (false);

-- Subscription
CREATE POLICY "block_direct_access" ON "Subscription"
  FOR ALL TO anon, authenticated USING (false);

-- UsageRecord
CREATE POLICY "block_direct_access" ON "UsageRecord"
  FOR ALL TO anon, authenticated USING (false);
