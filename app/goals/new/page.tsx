import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { PageHeader } from "@/components/ui/PageHeader";
import { GoalForm } from "@/components/GoalForm";
import { listCompanies } from "@/lib/store";
import { EmptyState } from "@/components/ui/EmptyState";

export const dynamic = "force-dynamic";

interface NewGoalPageProps {
  searchParams: Promise<{ companyId?: string }>;
}

export default async function NewGoalPage({ searchParams }: NewGoalPageProps) {
  const { companyId } = await searchParams;
  const companies = await listCompanies();

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "16px" }}>
        <PageHeader
          eyebrow="목표"
          title="목표 설정"
          description="실행할 목표와 작업을 정의합니다."
        />
        <Link href="/goals">
          <Button variant="ghost" size="sm">← 목표 목록</Button>
        </Link>
      </div>

      {companies.length === 0 ? (
        <EmptyState
          icon="🏢"
          title="등록된 회사가 없습니다"
          description="목표를 추가하려면 먼저 회사를 등록해야 합니다."
          primaryAction={{ href: "/company/new", label: "회사 등록하기" }}
        />
      ) : (
        <GoalForm
          companies={companies.map((c) => ({
            ...c,
            createdAt: c.createdAt instanceof Date ? c.createdAt.toISOString() : c.createdAt,
          }))}
          initialCompanyId={companyId}
        />
      )}
    </div>
  );
}
