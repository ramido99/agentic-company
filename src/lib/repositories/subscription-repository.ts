import { SubscriptionPlan, SubscriptionStatus } from "@prisma/client";

import { prisma } from "@/lib/db/prisma";

export type SubscriptionRecord = {
  id: string;
  workspaceId: string;
  plan: SubscriptionPlan;
  status: SubscriptionStatus;
  provider: string;
  providerCustomerId: string | null;
  providerBillingKey: string | null;
  currentPeriodStart: Date | null;
  currentPeriodEnd: Date | null;
  createdAt: Date;
  updatedAt: Date;
};

export type UpsertSubscriptionInput = {
  workspaceId: string;
  plan: SubscriptionPlan;
  status: SubscriptionStatus;
  provider?: string;
  providerCustomerId?: string | null;
  providerBillingKey?: string | null;
  currentPeriodStart?: Date | null;
  currentPeriodEnd?: Date | null;
};

export const subscriptionRepository = {
  async findCurrentByWorkspaceId(workspaceId: string): Promise<SubscriptionRecord | null> {
    return prisma.subscription.findFirst({
      where: { workspaceId },
      orderBy: { createdAt: "desc" },
    });
  },

  async upsertCurrent(input: UpsertSubscriptionInput): Promise<SubscriptionRecord> {
    const current = await prisma.subscription.findFirst({
      where: { workspaceId: input.workspaceId },
      orderBy: { createdAt: "desc" },
      select: { id: true },
    });

    if (!current) {
      return prisma.subscription.create({
        data: {
          workspaceId: input.workspaceId,
          plan: input.plan,
          status: input.status,
          provider: input.provider ?? "tosspayments",
          providerCustomerId: input.providerCustomerId,
          providerBillingKey: input.providerBillingKey,
          currentPeriodStart: input.currentPeriodStart,
          currentPeriodEnd: input.currentPeriodEnd,
        },
      });
    }

    return prisma.subscription.update({
      where: { id: current.id },
      data: {
        plan: input.plan,
        status: input.status,
        provider: input.provider ?? "tosspayments",
        providerCustomerId: input.providerCustomerId,
        providerBillingKey: input.providerBillingKey,
        currentPeriodStart: input.currentPeriodStart,
        currentPeriodEnd: input.currentPeriodEnd,
      },
    });
  },
};
