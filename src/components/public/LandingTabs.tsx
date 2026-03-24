"use client";

import Image from "next/image";
import { ReactNode, useState } from "react";

type TabItem = {
  id: string;
  label: string;
  content: ReactNode;
};

type LandingTabsProps = {
  tabs: TabItem[];
};

const tabItems = [
  {
    id: "control",
    label: "운영 데스크",
    title: "다음 행동이 바로 보이는 실행형 대시보드",
    description:
      "운영 개요를 나열하지 않고, 현재 단계와 즉시 실행 가능한 목표를 가장 먼저 보여 주는 커맨드 중심 워크스페이스입니다.",
    bullets: ["현재 단계 + 다음 액션", "실행 가능한 목표 우선 노출", "회사별 준비 상태 요약"],
    image: "/landing-control-tower.svg",
  },
  {
    id: "hiring",
    label: "역할 채용",
    title: "기능이 아니라 역할을 배치하는 채용 흐름",
    description:
      "역할, 전문성, 결과 책임을 기준으로 필요한 에이전트를 골라 운영 팀을 구성합니다.",
    bullets: ["역할 단위 비교", "전문화된 책임 범위", "워크플로 단계와 직접 연결"],
    image: "/landing-hiring-board.svg",
  },
  {
    id: "workflow",
    label: "실행 보드",
    title: "산출물이 순서대로 읽히는 실행 보드",
    description:
      "브리프, 계획, 체크리스트, 리뷰가 카드 모음이 아니라 하나의 작업 서사처럼 이어지는 결과 보드입니다.",
    bullets: ["단계 상태 스트림", "선택된 디테일 중심 레이아웃", "최종 리뷰와 액션 연결"],
    image: "/landing-execution-board.svg",
  },
] as const;

export function LandingTabs({ tabs }: LandingTabsProps = { tabs: tabItems as unknown as TabItem[] }) {
  const itemsToUse = tabs.length > 0 ? tabs : (tabItems as unknown as TabItem[]);
  const [activeId, setActiveId] = useState<string>(itemsToUse[0]?.id ?? "control");
  const active = itemsToUse.find((item) => item.id === activeId) ?? itemsToUse[0];

  return (
    <div className="public-panel public-panel-v2 space-y-6">
      <div className="space-y-2">
        <p className="eyebrow">워크스페이스 미리보기</p>
        <h2 className="section-display">하나의 제품 구조 안에서 실행 흐름이 자연스럽게 이어집니다</h2>
        <p className="section-copy">
          제품의 핵심은 화면 수가 아니라, 회사 생성부터 결과 검토까지 하나의 논리로 이어지는 워크플로입니다.
        </p>
      </div>

      <div className="public-tabs public-tabs-v2">
        {itemsToUse.map((item) => (
          <button
            key={item.id}
            type="button"
            className={
              item.id === active.id
                ? "public-tab public-tab-active border-b-2 border-[#4F46E5] text-slate-950 font-semibold"
                : "public-tab text-[var(--muted)] hover:text-slate-900"
            }
            onClick={() => setActiveId(item.id)}
          >
            {item.label}
          </button>
        ))}
      </div>

      <div className="landing-preview-grid">
        {active.content}
      </div>
    </div>
  );
}
