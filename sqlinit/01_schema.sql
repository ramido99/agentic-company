-- =============================================================================
-- 01_schema.sql — 전체 테이블 스키마 생성
-- Supabase SQL Editor에서 실행하거나, `npx prisma db push` 로 대체 가능
-- =============================================================================

-- ─── Enum 타입 ────────────────────────────────────────────────────────────────

CREATE TYPE IF NOT EXISTS "MembershipRole"      AS ENUM ('OWNER', 'MEMBER');
CREATE TYPE IF NOT EXISTS "WorkflowRunStatus"   AS ENUM ('QUEUED', 'RUNNING', 'COMPLETED', 'FAILED');
CREATE TYPE IF NOT EXISTS "AgentRole"           AS ENUM ('STRATEGIST', 'OPERATOR', 'REVIEWER');
CREATE TYPE IF NOT EXISTS "ArtifactType"        AS ENUM ('BRIEF', 'EXECUTION_PLAN', 'CHECKLIST', 'REVIEW');
CREATE TYPE IF NOT EXISTS "ArtifactStatus"      AS ENUM ('READY', 'APPROVED');
CREATE TYPE IF NOT EXISTS "SubscriptionPlan"    AS ENUM ('FREE', 'SOLO', 'STUDIO');
CREATE TYPE IF NOT EXISTS "SubscriptionStatus"  AS ENUM ('INCOMPLETE', 'ACTIVE', 'PAST_DUE', 'CANCELED');

-- ─── User ─────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS "User" (
  "id"            TEXT        NOT NULL DEFAULT gen_random_uuid()::text,
  "name"          TEXT,
  "email"         TEXT        UNIQUE,
  "emailVerified" TIMESTAMP(3),
  "image"         TEXT,
  "createdAt"     TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"     TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- ─── Account (NextAuth OAuth) ─────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS "Account" (
  "id"                TEXT NOT NULL DEFAULT gen_random_uuid()::text,
  "userId"            TEXT NOT NULL,
  "type"              TEXT NOT NULL,
  "provider"          TEXT NOT NULL,
  "providerAccountId" TEXT NOT NULL,
  "refresh_token"     TEXT,
  "access_token"      TEXT,
  "expires_at"        INTEGER,
  "token_type"        TEXT,
  "scope"             TEXT,
  "id_token"          TEXT,
  "session_state"     TEXT,

  CONSTRAINT "Account_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "Account_provider_providerAccountId_key" UNIQUE ("provider", "providerAccountId"),
  CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE
);

-- ─── Session ──────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS "Session" (
  "id"           TEXT        NOT NULL DEFAULT gen_random_uuid()::text,
  "sessionToken" TEXT        NOT NULL UNIQUE,
  "userId"       TEXT        NOT NULL,
  "expires"      TIMESTAMP(3) NOT NULL,

  CONSTRAINT "Session_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE
);

-- ─── VerificationToken ────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS "VerificationToken" (
  "identifier" TEXT        NOT NULL,
  "token"      TEXT        NOT NULL UNIQUE,
  "expires"    TIMESTAMP(3) NOT NULL,

  CONSTRAINT "VerificationToken_identifier_token_key" UNIQUE ("identifier", "token")
);

-- ─── Workspace ────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS "Workspace" (
  "id"        TEXT NOT NULL DEFAULT gen_random_uuid()::text,
  "name"      TEXT NOT NULL,
  "slug"      TEXT NOT NULL UNIQUE,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "Workspace_pkey" PRIMARY KEY ("id")
);

-- ─── Membership ───────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS "Membership" (
  "id"          TEXT             NOT NULL DEFAULT gen_random_uuid()::text,
  "userId"      TEXT             NOT NULL,
  "workspaceId" TEXT             NOT NULL,
  "role"        "MembershipRole" NOT NULL DEFAULT 'MEMBER',
  "createdAt"   TIMESTAMP(3)     NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "Membership_pkey"                PRIMARY KEY ("id"),
  CONSTRAINT "Membership_userId_workspaceId_key" UNIQUE ("userId", "workspaceId"),
  CONSTRAINT "Membership_userId_fkey"         FOREIGN KEY ("userId")      REFERENCES "User"("id")      ON DELETE CASCADE,
  CONSTRAINT "Membership_workspaceId_fkey"    FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE
);

-- ─── Company ──────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS "Company" (
  "id"          TEXT         NOT NULL DEFAULT gen_random_uuid()::text,
  "workspaceId" TEXT         NOT NULL,
  "createdById" TEXT,
  "name"        TEXT         NOT NULL,
  "idea"        TEXT         NOT NULL,
  "createdAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "Company_pkey"             PRIMARY KEY ("id"),
  CONSTRAINT "Company_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE,
  CONSTRAINT "Company_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id")      ON DELETE SET NULL
);

-- ─── Goal ─────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS "Goal" (
  "id"          TEXT         NOT NULL DEFAULT gen_random_uuid()::text,
  "workspaceId" TEXT         NOT NULL,
  "companyId"   TEXT         NOT NULL,
  "createdById" TEXT,
  "title"       TEXT         NOT NULL,
  "task"        TEXT         NOT NULL,
  "createdAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "Goal_pkey"             PRIMARY KEY ("id"),
  CONSTRAINT "Goal_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE,
  CONSTRAINT "Goal_companyId_fkey"   FOREIGN KEY ("companyId")   REFERENCES "Company"("id")   ON DELETE CASCADE,
  CONSTRAINT "Goal_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id")      ON DELETE SET NULL
);

-- ─── WorkflowRun ──────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS "WorkflowRun" (
  "id"              TEXT                NOT NULL DEFAULT gen_random_uuid()::text,
  "workspaceId"     TEXT                NOT NULL,
  "companyId"       TEXT                NOT NULL,
  "goalId"          TEXT                NOT NULL,
  "triggeredById"   TEXT,
  "task"            TEXT                NOT NULL,
  "status"          "WorkflowRunStatus" NOT NULL DEFAULT 'QUEUED',
  "createdAt"       TIMESTAMP(3)        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"       TIMESTAMP(3)        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "completedAt"     TIMESTAMP(3),

  CONSTRAINT "WorkflowRun_pkey"              PRIMARY KEY ("id"),
  CONSTRAINT "WorkflowRun_workspaceId_fkey"  FOREIGN KEY ("workspaceId")   REFERENCES "Workspace"("id") ON DELETE CASCADE,
  CONSTRAINT "WorkflowRun_companyId_fkey"    FOREIGN KEY ("companyId")     REFERENCES "Company"("id")   ON DELETE CASCADE,
  CONSTRAINT "WorkflowRun_goalId_fkey"       FOREIGN KEY ("goalId")        REFERENCES "Goal"("id")      ON DELETE CASCADE,
  CONSTRAINT "WorkflowRun_triggeredById_fkey" FOREIGN KEY ("triggeredById") REFERENCES "User"("id")     ON DELETE SET NULL
);

-- ─── Artifact ─────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS "Artifact" (
  "id"              TEXT             NOT NULL DEFAULT gen_random_uuid()::text,
  "workflowRunId"   TEXT             NOT NULL,
  "role"            "AgentRole"      NOT NULL,
  "type"            "ArtifactType"   NOT NULL,
  "title"           TEXT             NOT NULL,
  "summary"         TEXT             NOT NULL,
  "content"         JSONB            NOT NULL,
  "status"          "ArtifactStatus" NOT NULL,
  "position"        INTEGER          NOT NULL,
  "createdAt"       TIMESTAMP(3)     NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "Artifact_pkey"                          PRIMARY KEY ("id"),
  CONSTRAINT "Artifact_workflowRunId_position_key"   UNIQUE ("workflowRunId", "position"),
  CONSTRAINT "Artifact_workflowRunId_fkey"           FOREIGN KEY ("workflowRunId") REFERENCES "WorkflowRun"("id") ON DELETE CASCADE
);

-- ─── AgentSkillAssignment ─────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS "AgentSkillAssignment" (
  "id"          TEXT         NOT NULL DEFAULT gen_random_uuid()::text,
  "workspaceId" TEXT         NOT NULL,
  "agentId"     TEXT         NOT NULL,
  "skillId"     TEXT         NOT NULL,
  "createdAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "AgentSkillAssignment_pkey"                          PRIMARY KEY ("id"),
  CONSTRAINT "AgentSkillAssignment_workspaceId_agentId_skillId_key" UNIQUE ("workspaceId", "agentId", "skillId"),
  CONSTRAINT "AgentSkillAssignment_workspaceId_fkey"              FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE
);

-- ─── UserAIProviderSetting ────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS "UserAIProviderSetting" (
  "id"               TEXT         NOT NULL DEFAULT gen_random_uuid()::text,
  "userId"           TEXT         NOT NULL UNIQUE,
  "provider"         TEXT         NOT NULL DEFAULT 'openai',
  "apiEndpoint"      TEXT         NOT NULL,
  "apiKeyEncrypted"  TEXT         NOT NULL,
  "defaultModel"     TEXT         NOT NULL,
  "isActive"         BOOLEAN      NOT NULL DEFAULT true,
  "lastValidatedAt"  TIMESTAMP(3),
  "createdAt"        TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"        TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "UserAIProviderSetting_pkey"   PRIMARY KEY ("id"),
  CONSTRAINT "UserAIProviderSetting_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE
);

-- ─── Subscription ─────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS "Subscription" (
  "id"                  TEXT                 NOT NULL DEFAULT gen_random_uuid()::text,
  "workspaceId"         TEXT                 NOT NULL,
  "plan"                "SubscriptionPlan"   NOT NULL DEFAULT 'FREE',
  "status"              "SubscriptionStatus" NOT NULL DEFAULT 'INCOMPLETE',
  "provider"            TEXT                 NOT NULL DEFAULT 'tosspayments',
  "providerCustomerId"  TEXT,
  "providerBillingKey"  TEXT,
  "currentPeriodStart"  TIMESTAMP(3),
  "currentPeriodEnd"    TIMESTAMP(3),
  "createdAt"           TIMESTAMP(3)         NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"           TIMESTAMP(3)         NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "Subscription_pkey"             PRIMARY KEY ("id"),
  CONSTRAINT "Subscription_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE
);

-- ─── UsageRecord ──────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS "UsageRecord" (
  "id"              TEXT         NOT NULL DEFAULT gen_random_uuid()::text,
  "workspaceId"     TEXT         NOT NULL,
  "userId"          TEXT,
  "workflowRunId"   TEXT,
  "metric"          TEXT         NOT NULL,
  "value"           INTEGER      NOT NULL,
  "metadata"        JSONB,
  "createdAt"       TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "UsageRecord_pkey"              PRIMARY KEY ("id"),
  CONSTRAINT "UsageRecord_workspaceId_fkey"  FOREIGN KEY ("workspaceId")   REFERENCES "Workspace"("id")    ON DELETE CASCADE,
  CONSTRAINT "UsageRecord_userId_fkey"       FOREIGN KEY ("userId")        REFERENCES "User"("id")         ON DELETE SET NULL,
  CONSTRAINT "UsageRecord_workflowRunId_fkey" FOREIGN KEY ("workflowRunId") REFERENCES "WorkflowRun"("id") ON DELETE SET NULL
);
