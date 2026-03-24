import { WorkflowRunStatus } from "@prisma/client";

import { prisma } from "@/lib/db/prisma";
import { getDefaultWorkspaceId } from "@/lib/db/default-workspace";

export type CreateWorkflowRunInput = {
  companyId: string;
  goalId: string;
  task: string;
  workspaceId?: string;
  triggeredById?: string | null;
  status?: WorkflowRunStatus;
  completedAt?: Date | null;
};

const artifactsInclude = {
  artifacts: {
    orderBy: { position: "asc" as const },
  },
};

export const workflowRunRepository = {
  async list() {
    const workspaceId = await getDefaultWorkspaceId();
    return prisma.workflowRun.findMany({
      where: { workspaceId },
      include: artifactsInclude,
      orderBy: { createdAt: "desc" },
    });
  },

  async findById(runId: string) {
    return prisma.workflowRun.findFirst({
      where: { id: runId },
      include: artifactsInclude,
    });
  },

  async listByWorkspaceId(workspaceId: string) {
    return prisma.workflowRun.findMany({
      where: { workspaceId },
      include: artifactsInclude,
      orderBy: { createdAt: "desc" },
    });
  },

  async findByIdInWorkspace(runId: string, workspaceId: string) {
    return prisma.workflowRun.findFirst({
      where: { id: runId, workspaceId },
      include: artifactsInclude,
    });
  },

  async create(input: CreateWorkflowRunInput) {
    const workspaceId = input.workspaceId ?? (await getDefaultWorkspaceId());
    return prisma.workflowRun.create({
      data: {
        workspaceId,
        companyId: input.companyId,
        goalId: input.goalId,
        triggeredById: input.triggeredById,
        task: input.task,
        status: input.status ?? WorkflowRunStatus.QUEUED,
        completedAt: input.completedAt,
      },
      include: artifactsInclude,
    });
  },

  async listByGoalId(goalId: string) {
    return prisma.workflowRun.findMany({
      where: { goalId },
      include: artifactsInclude,
      orderBy: { createdAt: "desc" },
    });
  },

  async listByCompanyId(companyId: string) {
    return prisma.workflowRun.findMany({
      where: { companyId },
      include: artifactsInclude,
      orderBy: { createdAt: "desc" },
    });
  },

  async updateStatus(runId: string, status: WorkflowRunStatus, completedAt?: Date | null) {
    return prisma.workflowRun.update({
      where: { id: runId },
      data: { status, completedAt },
    });
  },
};
