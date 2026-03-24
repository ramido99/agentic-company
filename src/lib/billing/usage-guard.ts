import { companyRepository } from "@/lib/repositories/company-repository";
import { usageRecordRepository } from "@/lib/repositories/usage-record-repository";
import { workflowRunRepository } from "@/lib/repositories/workflow-run-repository";
import { subscriptionRepository } from "@/lib/repositories/subscription-repository";
import { agentHiringRepository } from "@/lib/repositories/agent-hiring-repository";
import { resolveWorkspaceId } from "@/lib/store";
import {
  getFallbackPlanDefinition,
  getPlanDefinitionByTier,
  prismaPlantToTier,
} from "@/lib/billing/plans";

function isSameMonth(date: string | Date, now: Date) {
  const value = date instanceof Date ? date : new Date(date);
  return value.getUTCFullYear() === now.getUTCFullYear() && value.getUTCMonth() === now.getUTCMonth();
}

export async function getPlanUsageSnapshot() {
  const workspaceId = await resolveWorkspaceId();
  const now = new Date();

  const [companies, workflowRuns, usageRecords, subscription] = await Promise.all([
    companyRepository.listByWorkspaceId(workspaceId),
    workflowRunRepository.listByWorkspaceId(workspaceId),
    usageRecordRepository.listByWorkspaceId(workspaceId),
    subscriptionRepository.findCurrentByWorkspaceId(workspaceId),
  ]);

  // DB 구독 기반으로 플랜 결정, 없으면 FREE 폴백
  const plan = subscription
    ? getPlanDefinitionByTier(prismaPlantToTier(subscription.plan))
    : getFallbackPlanDefinition();

  const currentMonthRuns = workflowRuns.filter((run) => isSameMonth(run.createdAt, now)).length;
  const strategistTokens = usageRecords
    .filter((r) => r.metric === "strategist_tokens_total" && isSameMonth(r.createdAt, now))
    .reduce((sum, r) => sum + r.value, 0);

  return {
    plan,
    subscription,
    usage: {
      companies: companies.length,
      workflowRunsThisMonth: currentMonthRuns,
      strategistTokensThisMonth: strategistTokens,
    },
    remaining: {
      companies: Math.max(plan.limits.companies - companies.length, 0),
      workflowRunsThisMonth: Math.max(plan.limits.workflowRunsPerMonth - currentMonthRuns, 0),
      strategistTokensThisMonth: Math.max(plan.limits.strategistTokensPerMonth - strategistTokens, 0),
    },
  };
}

export async function assertCanCreateCompany() {
  const snapshot = await getPlanUsageSnapshot();
  if (snapshot.usage.companies >= snapshot.plan.limits.companies) {
    throw new Error(`현재 ${snapshot.plan.label} 플랜에서는 회사를 최대 ${snapshot.plan.limits.companies}개까지 등록할 수 있습니다.`);
  }
}

export async function assertCanRunWorkflow() {
  const snapshot = await getPlanUsageSnapshot();
  if (snapshot.usage.workflowRunsThisMonth >= snapshot.plan.limits.workflowRunsPerMonth) {
    throw new Error(`현재 ${snapshot.plan.label} 플랜의 월간 워크플로우 실행 한도를 모두 사용했습니다.`);
  }
}

export async function assertCanHireAgent() {
  const snapshot = await getPlanUsageSnapshot();
  const myAgents = await agentHiringRepository.listMyAgents();
  const hiredCount = myAgents.length;
  const maxAllowed = snapshot.plan.limits.maxHiredAgents;

  if (hiredCount >= maxAllowed) {
    throw new Error(
      `현재 ${snapshot.plan.label} 플랜에서는 최대 ${maxAllowed}명의 에이전트를 채용할 수 있습니다. ` +
      `(현재 ${hiredCount}/${maxAllowed}명)`
    );
  }
}
