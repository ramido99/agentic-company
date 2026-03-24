import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { DeleteCompanyButton } from "@/components/DeleteCompanyButton";
import { listCompanies, listGoals, listWorkflowRuns } from "@/lib/store";

export const dynamic = "force-dynamic";

export default async function CompaniesPage() {
  const [companies, goals, runs] = await Promise.all([
    listCompanies(), listGoals(), listWorkflowRuns(),
  ]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "16px", flexWrap: "wrap" }}>
        <div>
          <span className="page-eyebrow">회사</span>
          <h1 className="page-title">회사 관리</h1>
          <p className="page-description">만든 회사들을 관리하고 새 회사를 등록합니다.</p>
        </div>
        <Link href="/company/new"><Button variant="primary">새 회사 등록</Button></Link>
      </div>

      {companies.length === 0 ? (
        <EmptyState
          icon="🏢" title="회사가 없습니다" description="새 회사를 등록하여 시작하세요."
          primaryAction={{ href: "/company/new", label: "새 회사 등록" }}
        />
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "20px" }}>
          {companies.map((company) => {
            const cGoals = goals.filter((g) => g.companyId === company.id);
            const cRuns = runs.filter((r) => r.companyId === company.id);
            const completedRuns = cRuns.filter((r) => r.status === "COMPLETED");
            return (
              <div key={company.id} style={{ position: "relative" }}>
                <Link href={`/companies/${company.id}`} style={{ textDecoration: "none", display: "block" }}>
                  <div className="card card-hover" style={{ padding: "22px", display: "flex", flexDirection: "column", gap: "14px", height: "100%", cursor: "pointer" }}>
                    {/* 회사명 + 아이디어 */}
                    <div style={{ flex: 1, paddingRight: "36px" }}>
                      <h3 style={{ fontSize: "16px", fontWeight: 700, color: "var(--text)", marginBottom: "6px" }}>{company.name}</h3>
                      <p style={{ fontSize: "13px", color: "var(--text-muted)", lineHeight: 1.6 }}>{company.idea}</p>
                    </div>

                    {/* 배지 */}
                    <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                      <Badge variant="neutral">목표 {cGoals.length}개</Badge>
                      <Badge variant="neutral">실행 {cRuns.length}회</Badge>
                      {completedRuns.length > 0 && (
                        <Badge variant="success">완료 {completedRuns.length}회</Badge>
                      )}
                    </div>

                    {/* 생성일 */}
                    <p style={{ fontSize: "11px", color: "var(--text-faint)", borderTop: "1px solid var(--border)", paddingTop: "10px" }}>
                      생성일: {new Date(company.createdAt).toLocaleDateString("ko-KR")}
                    </p>
                  </div>
                </Link>

                {/* 삭제 버튼 — 카드 오른쪽 상단에 겹쳐서 표시 (Link 바깥에 위치해 클릭 충돌 없음) */}
                <div style={{ position: "absolute", top: "14px", right: "14px" }}>
                  <DeleteCompanyButton
                    companyId={company.id}
                    companyName={company.name}
                    runCount={cRuns.length}
                    variant="icon-text"
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
