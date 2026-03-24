import { Prisma } from "@prisma/client";

import { prisma } from "@/lib/db/prisma";
import { getDefaultWorkspaceId } from "@/lib/db/default-workspace";

export type CreateUsageRecordInput = {
  metric: string;
  value: number;
  workspaceId?: string;
  userId?: string | null;
  workflowRunId?: string | null;
  metadata?: Record<string, unknown>;
};

export const usageRecordRepository = {
  async list() {
    const workspaceId = await getDefaultWorkspaceId();
    return prisma.usageRecord.findMany({
      where: { workspaceId },
      orderBy: { createdAt: "desc" },
    });
  },

  async listByWorkflowRunId(workflowRunId: string) {
    return prisma.usageRecord.findMany({
      where: { workflowRunId },
      orderBy: { createdAt: "desc" },
    });
  },

  async listByWorkspaceId(workspaceId: string) {
    return prisma.usageRecord.findMany({
      where: { workspaceId },
      orderBy: { createdAt: "desc" },
    });
  },

  async create(input: CreateUsageRecordInput) {
    const workspaceId = input.workspaceId ?? (await getDefaultWorkspaceId());
    return prisma.usageRecord.create({
      data: {
        workspaceId,
        userId: input.userId,
        workflowRunId: input.workflowRunId,
        metric: input.metric,
        value: input.value,
        metadata: input.metadata as Prisma.InputJsonValue | undefined,
      },
    });
  },
};
