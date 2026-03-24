import { AgentRole, ArtifactStatus, ArtifactType, Prisma } from "@prisma/client";

import { prisma } from "@/lib/db/prisma";

export type CreateWorkflowArtifactInput = {
  workflowRunId: string;
  role: AgentRole;
  type: ArtifactType;
  title: string;
  summary: string;
  content: unknown;
  status: ArtifactStatus;
  position: number;
};

export const artifactRepository = {
  async listByWorkflowRunId(workflowRunId: string) {
    return prisma.artifact.findMany({
      where: { workflowRunId },
      orderBy: { position: "asc" },
    });
  },

  async createManyForWorkflowRun(artifacts: CreateWorkflowArtifactInput[]) {
    if (artifacts.length === 0) return { count: 0 };

    return prisma.artifact.createMany({
      data: artifacts.map((a) => ({
        ...a,
        content: a.content as Prisma.InputJsonValue,
      })),
    });
  },
};
