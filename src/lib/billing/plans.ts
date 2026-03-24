import { SubscriptionPlan } from "@prisma/client";

export type PlanTier = "free" | "solo" | "studio";

export type PlanLimits = {
  companies: number;
  workflowRunsPerMonth: number;
  strategistTokensPerMonth: number;
  /** builtIn 3개 포함, 추가로 채용 가능한 총 에이전트 수 */
  maxHiredAgents: number;
};

export type PlanDefinition = {
  tier: PlanTier;
  label: string;
  description: string;
  monthlyPrice: number; // 원
  limits: PlanLimits;
};

export const planDefinitions: Record<PlanTier, PlanDefinition> = {
  free: {
    tier: "free",
    label: "Free",
    description: "기본 검증과 첫 워크플로우 실행에 적합한 시작 플랜",
    monthlyPrice: 0,
    limits: {
      companies: 2,
      workflowRunsPerMonth: 5,
      strategistTokensPerMonth: 50000,
      maxHiredAgents: 3, // builtIn 3개만
    },
  },
  solo: {
    tier: "solo",
    label: "Solo",
    description: "개인 운영자에게 맞는 단일 사용자 플랜",
    monthlyPrice: 29000,
    limits: {
      companies: 10,
      workflowRunsPerMonth: 50,
      strategistTokensPerMonth: 500000,
      maxHiredAgents: 6, // builtIn 3개 + 추가 3개 무료
    },
  },
  studio: {
    tier: "studio",
    label: "Studio",
    description: "여러 프로젝트를 함께 운영하는 팀용 플랜",
    monthlyPrice: 99000,
    limits: {
      companies: 50,
      workflowRunsPerMonth: 300,
      strategistTokensPerMonth: 3000000,
      maxHiredAgents: 12, // builtIn 3개 + 추가 9개 무료
    },
  },
};

/** Prisma enum → PlanTier 변환 */
export function prismaPlantToTier(plan: SubscriptionPlan): PlanTier {
  switch (plan) {
    case SubscriptionPlan.SOLO: return "solo";
    case SubscriptionPlan.STUDIO: return "studio";
    default: return "free";
  }
}

/** PlanTier → Prisma enum 변환 */
export function tierToPrismaPlan(tier: PlanTier): SubscriptionPlan {
  switch (tier) {
    case "solo": return SubscriptionPlan.SOLO;
    case "studio": return SubscriptionPlan.STUDIO;
    default: return SubscriptionPlan.FREE;
  }
}

/** DB 구독 없거나 FREE일 때 폴백용 */
export function getFallbackPlanDefinition(): PlanDefinition {
  return planDefinitions["free"];
}

export function getPlanDefinitionByTier(tier: PlanTier): PlanDefinition {
  return planDefinitions[tier];
}
