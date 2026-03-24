import Link from "next/link";
import { Button } from "@/components/ui/Button";

export const metadata = { title: "시작 가이드 | agentic company" };

const steps = [
  { step: "01", title: "회사 등록", description: "운영 기준이 될 회사를 등록하고 사업 문맥을 정리합니다.", href: "/company/new" },
  { step: "02", title: "AI 인력 채용", description: "전략가, 실행담당, 검토자를 배치하고 역할 구조를 만듭니다.", href: "/agents" },
  { step: "03", title: "목표 설정", description: "이번 실행에서 어떤 결과물을 만들지 목표와 작업 설명으로 정의합니다.", href: "/goals/new" },
  { step: "04", title: "워크플로 실행", description: "브리프부터 리뷰까지 구조화된 실행 흐름을 시작하고 결과를 검토합니다.", href: "/dashboard" },
] as const;

const tips = [
  { title: "회사 등록", body: "회사를 먼저 등록하면 이후 모든 데이터가 이 기준 아래 연결됩니다. 사업 아이디어와 목표를 명확히 적어주세요." },
  { title: "인력 채용", body: "필요한 역할의 AI 인력을 채용합니다. 전략가, 실행담당, 검토자 중에서 선택하세요." },
  { title: "목표 설정", body: "구체적이고 측정 가능한 목표를 설정합니다. 이 목표를 중심으로 워크플로가 실행됩니다." },
];

export default function OnboardingPage() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "32px" }}>
      <div>
        <span className="page-eyebrow">시작하기</span>
        <h1 className="page-title">Agentic Company 시작 가이드</h1>
        <p className="page-description">4단계를 따라 첫 번째 AI 조직을 구성해 보세요.</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px" }}>
        {steps.map((step) => (
          <div key={step.step} className="card card-hover" style={{ padding: "24px", borderLeft: "3px solid rgba(167,139,250,0.5)", display: "flex", flexDirection: "column", gap: "16px" }}>
            <div style={{ width: "40px", height: "40px", borderRadius: "50%", background: "linear-gradient(135deg, #7c3aed, #38bdf8)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span style={{ fontSize: "13px", fontWeight: 800, color: "white" }}>{step.step}</span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "6px", flex: 1 }}>
              <h3 style={{ fontSize: "16px", fontWeight: 700, color: "var(--text)" }}>{step.title}</h3>
              <p style={{ fontSize: "13px", color: "var(--text-muted)", lineHeight: 1.6 }}>{step.description}</p>
            </div>
            <Link href={step.href} style={{ display: "block" }}><Button variant="secondary" size="sm">시작하기</Button></Link>
          </div>
        ))}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        <p className="section-title">원활한 시작을 위한 팁</p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px" }}>
          {tips.map((tip) => (
            <div key={tip.title} className="card" style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "8px" }}>
              <h4 style={{ fontSize: "14px", fontWeight: 700, color: "var(--text)" }}>{tip.title}</h4>
              <p style={{ fontSize: "13px", color: "var(--text-muted)", lineHeight: 1.6 }}>{tip.body}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
