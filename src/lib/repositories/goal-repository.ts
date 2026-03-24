import { prisma } from "@/lib/db/prisma";
import { getDefaultWorkspaceId } from "@/lib/db/default-workspace";

export type CreateGoalInput = {
  companyId: string;
  title: string;
  task: string;
  workspaceId?: string;
  createdById?: string | null;
};

export const goalRepository = {
  async list() {
    const workspaceId = await getDefaultWorkspaceId();
    return prisma.goal.findMany({
      where: { workspaceId },
      orderBy: { createdAt: "desc" },
    });
  },

  async findById(goalId: string) {
    return prisma.goal.findFirst({
      where: { id: goalId },
    });
  },

  async listByWorkspaceId(workspaceId: string) {
    return prisma.goal.findMany({
      where: { workspaceId },
      orderBy: { createdAt: "desc" },
    });
  },

  async findByIdInWorkspace(goalId: string, workspaceId: string) {
    return prisma.goal.findFirst({
      where: { id: goalId, workspaceId },
    });
  },

  async create(input: Pick<CreateGoalInput, "companyId" | "title" | "task">) {
    const workspaceId = await getDefaultWorkspaceId();
    return prisma.goal.create({
      data: {
        workspaceId,
        companyId: input.companyId,
        title: input.title.trim(),
        task: input.task.trim(),
      },
    });
  },

  async listByCompanyId(companyId: string) {
    return prisma.goal.findMany({
      where: { companyId },
      orderBy: { createdAt: "desc" },
    });
  },

  async createInWorkspace(input: CreateGoalInput) {
    const workspaceId = input.workspaceId ?? (await getDefaultWorkspaceId());
    return prisma.goal.create({
      data: {
        workspaceId,
        companyId: input.companyId,
        createdById: input.createdById,
        title: input.title.trim(),
        task: input.task.trim(),
      },
    });
  },
};
