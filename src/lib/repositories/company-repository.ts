import { prisma } from "@/lib/db/prisma";
import { getDefaultWorkspaceId } from "@/lib/db/default-workspace";
import { deleteCompanyStorageFiles } from "@/lib/storage/supabase-storage";

export type CreateCompanyInput = {
  name: string;
  idea: string;
  workspaceId?: string;
  createdById?: string | null;
};

export const companyRepository = {
  async list() {
    const workspaceId = await getDefaultWorkspaceId();
    return prisma.company.findMany({
      where: { workspaceId },
      orderBy: { createdAt: "desc" },
    });
  },

  async findById(companyId: string) {
    return prisma.company.findFirst({
      where: { id: companyId },
    });
  },

  async listByWorkspaceId(workspaceId: string) {
    return prisma.company.findMany({
      where: { workspaceId },
      orderBy: { createdAt: "desc" },
    });
  },

  async findByIdInWorkspace(companyId: string, workspaceId: string) {
    return prisma.company.findFirst({
      where: { id: companyId, workspaceId },
    });
  },

  async create(input: Pick<CreateCompanyInput, "name" | "idea">) {
    const workspaceId = await getDefaultWorkspaceId();
    return prisma.company.create({
      data: {
        workspaceId,
        name: input.name.trim(),
        idea: input.idea.trim(),
      },
    });
  },

  async createInWorkspace(input: CreateCompanyInput) {
    const workspaceId = input.workspaceId ?? (await getDefaultWorkspaceId());
    return prisma.company.create({
      data: {
        workspaceId,
        createdById: input.createdById,
        name: input.name.trim(),
        idea: input.idea.trim(),
      },
    });
  },

  /**
   * 회사 삭제 — Storage 파일 → DB 레코드(cascade) 순서로 삭제합니다.
   * Goal / WorkflowRun / Artifact 는 DB cascade 로 자동 삭제됩니다.
   */
  async deleteWithAllData(companyId: string): Promise<{ deletedRunCount: number }> {
    const company = await prisma.company.findFirst({
      where: { id: companyId },
      select: { workspaceId: true },
    });

    if (!company) throw new Error("회사를 찾을 수 없습니다.");

    // 해당 회사의 모든 워크플로우 실행 ID 조회 (Storage 삭제용)
    const runs = await prisma.workflowRun.findMany({
      where: { companyId },
      select: { id: true },
    });
    const runIds = runs.map((r) => r.id);

    // 1) Supabase Storage 파일 삭제 (에러 무시 — DB 삭제는 반드시 수행)
    try {
      await deleteCompanyStorageFiles(company.workspaceId, runIds);
    } catch {
      // Storage 환경변수 미설정 등의 경우에도 DB 삭제는 계속 진행
    }

    // 2) DB 삭제 (Goal → WorkflowRun → Artifact 모두 cascade)
    await prisma.company.delete({ where: { id: companyId } });

    return { deletedRunCount: runIds.length };
  },
};
