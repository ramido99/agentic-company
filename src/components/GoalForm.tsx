"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

import { Company } from "@/lib/types";
import { Button } from "@/components/ui/Button";

export function GoalForm({
  companies,
  initialCompanyId,
}: {
  companies: Company[];
  initialCompanyId?: string;
}) {
  const router = useRouter();
  const startingCompanyId =
    companies.find((company) => company.id === initialCompanyId)?.id ?? companies[0]?.id ?? "";
  const [companyId, setCompanyId] = useState(startingCompanyId);
  const [title, setTitle] = useState("");
  const [task, setTask] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const selectedCompany = companies.find((company) => company.id === companyId);
  const isComplete = title.trim().length > 0 && task.trim().length > 0;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError("");

    const response = await fetch("/api/goals", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ companyId, title, task }),
    });

    const data = await response.json();

    if (!response.ok) {
      setError(data.error ?? "목표 저장 중 문제가 발생했습니다.");
      setSubmitting(false);
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  return (
    <form className="shell-panel space-y-8" onSubmit={handleSubmit}>
      <div className="space-y-2 border-b border-[var(--border)] pb-5">
        <p className="eyebrow">입력 폼</p>
        <h3 className="text-2xl font-semibold text-slate-950">목표와 작업 정의</h3>
        <p className="text-sm leading-6 text-[var(--muted)]">
          실행 흐름이 어떤 결과물을 만들어야 하는지 간결하게 정리해 주세요.
        </p>

        <div className="journey-note">
          <div>
            <p className="journey-note-label">연결 기준</p>
            <p className="journey-note-value">{selectedCompany?.name ?? "회사 선택 필요"}</p>
          </div>
          <div>
            <p className="journey-note-label">다음 액션</p>
            <p className="journey-note-value">워크플로 실행</p>
          </div>
          <div>
            <p className="journey-note-label">결과물</p>
            <p className="journey-note-value">브리프 · 계획 · 체크리스트 · 리뷰</p>
          </div>
        </div>
      </div>

      <div className="form-layout">
        <div className="space-y-8">
          <div className="space-y-3 rounded-2xl border border-[var(--border)] bg-[var(--surface-soft)] p-5">
            <label className="text-sm font-medium text-slate-900" htmlFor="companyId">
              연결할 회사
            </label>
            <p className="text-sm leading-6 text-[var(--muted)]">
              이 목표가 속할 회사를 선택해 주세요.
            </p>
            <select
              id="companyId"
              className="field"
              onChange={(event) => setCompanyId(event.target.value)}
              required
              value={companyId}
            >
              {companies.map((company) => (
                <option key={company.id} value={company.id}>
                  {company.name}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-3 rounded-2xl border border-[var(--border)] bg-[var(--surface-soft)] p-5">
            <label className="text-sm font-medium text-slate-900" htmlFor="title">
              목표 이름
            </label>
            <p className="text-sm leading-6 text-[var(--muted)]">
              이번 실행이 어떤 결과를 내야 하는지 한 줄로 표현해 주세요.
            </p>
            <input
              id="title"
              className="field"
              onChange={(event) => setTitle(event.target.value)}
              placeholder="예: 첫 유료 검증 캠페인 준비"
              required
              value={title}
            />
          </div>

          <div className="space-y-3 rounded-2xl border border-[var(--border)] bg-[var(--surface-soft)] p-5">
            <label className="text-sm font-medium text-slate-900" htmlFor="task">
              실행 작업 설명
            </label>
            <p className="text-sm leading-6 text-[var(--muted)]">
              실행 흐름이 어떤 결과물을 만들면 좋은지 구체적으로 적어 주세요.
            </p>
            <textarea
              id="task"
              className="field min-h-32"
              onChange={(event) => setTask(event.target.value)}
              placeholder="예: 첫 주 실행용 간단한 시장 진입 계획과 체크리스트를 만들어 줘."
              required
              value={task}
            />
          </div>
        </div>

        <aside className="form-sidebar">
          <article className="preview-card space-y-4">
            <div className="space-y-1">
              <p className="summary-label">목표 프리뷰</p>
              <p className="text-lg font-semibold text-slate-950">{title.trim() || "목표 제목이 여기에 표시됩니다"}</p>
              <p className="text-sm leading-6 text-[var(--muted)]">
                {task.trim() || "작업 설명은 브리프와 실행 계획의 기준 문장으로 사용됩니다."}
              </p>
            </div>
            <div className="mini-summary-card">
              <p className="summary-label">연결 회사</p>
              <p className="summary-value">{selectedCompany?.name ?? "선택 필요"}</p>
            </div>
          </article>

          <article className="preview-card space-y-4">
            <div className="space-y-1">
              <p className="summary-label">저장 후 흐름</p>
              <p className="text-sm leading-6 text-[var(--muted)]">
                저장이 끝나면 대시보드로 돌아가 바로 워크플로를 실행할 수 있습니다.
              </p>
            </div>

            <div className="grid gap-3">
              <div className="subtle-empty">
                <p className="text-sm font-semibold text-slate-950">1. 브리프 생성</p>
                <p className="mt-1 text-sm leading-6 text-[var(--muted)]">전략가가 목표를 실행 문맥으로 정리합니다.</p>
              </div>
              <div className="subtle-empty">
                <p className="text-sm font-semibold text-slate-950">2. 실행 계획과 체크리스트</p>
                <p className="mt-1 text-sm leading-6 text-[var(--muted)]">실행 담당이 바로 쓸 수 있는 계획을 만듭니다.</p>
              </div>
              <div className="subtle-empty">
                <p className="text-sm font-semibold text-slate-950">3. 최종 리뷰</p>
                <p className="mt-1 text-sm leading-6 text-[var(--muted)]">검토자가 결과 완결성을 확인합니다.</p>
              </div>
            </div>
          </article>
        </aside>
      </div>

      {error ? <p className="text-sm text-red-700">{error}</p> : null}

      <div className="flex flex-col gap-3 border-t border-[var(--border)] pt-5 sm:flex-row sm:items-center sm:justify-between">
        <Button
          variant="primary"
          size="md"
          disabled={submitting || !isComplete}
          type="submit"
        >
          {submitting ? "목표 저장 중..." : "목표 저장하기"}
        </Button>
        <p className="text-sm text-[var(--muted)]">
          저장 후 대시보드에서 바로 실행 흐름을 시작할 수 있습니다.
        </p>
      </div>
    </form>
  );
}
