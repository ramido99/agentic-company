import { NextRequest, NextResponse } from "next/server";
import { companyRepository } from "@/lib/repositories/company-repository";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function DELETE(_req: NextRequest, context: RouteContext) {
  const { id } = await context.params;

  if (!id) {
    return NextResponse.json({ error: "companyId가 필요합니다." }, { status: 400 });
  }

  try {
    const result = await companyRepository.deleteWithAllData(id);
    return NextResponse.json(
      {
        success: true,
        message: `회사가 삭제되었습니다. (워크플로우 실행 ${result.deletedRunCount}건 포함)`,
        deletedRunCount: result.deletedRunCount,
      },
      { status: 200 },
    );
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "회사 삭제에 실패했습니다.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
