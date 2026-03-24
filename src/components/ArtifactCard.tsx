"use client";

import { useState } from "react";
import { Artifact } from "@/lib/types";
import { Badge } from "@/components/ui/Badge";

const roleLabel = {
  strategist: "전략가",
  operator: "실행 담당",
  reviewer: "검토자",
} as const;

const typeLabel = {
  brief: "브리프",
  "execution-plan": "실행 계획",
  checklist: "체크리스트",
  review: "리뷰",
} as const;

const statusLabel = {
  ready: "생성 완료",
  approved: "검토 완료",
} as const;

const typeBadgeVariant: Record<Artifact["type"], "brand" | "success" | "warning" | "danger" | "neutral"> = {
  brief: "brand",
  "execution-plan": "neutral",
  checklist: "warning",
  review: "success",
};

type ArtifactCardProps = {
  artifact: Artifact;
  index: number;
};

export function ArtifactCard({ artifact, index }: ArtifactCardProps) {
  const [expanded, setExpanded] = useState(false);
  const showMoreButton = artifact.content.length > 5;
  const displayedContent = expanded ? artifact.content : artifact.content.slice(0, 5);

  return (
    <article className="artifact-card artifact-card-v2">
      <div className="artifact-card-header">
        <div className="artifact-index">{`0${index + 1}`}</div>

        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant={typeBadgeVariant[artifact.type]}>
              {typeLabel[artifact.type]}
            </Badge>
            <span className="soft-label">{roleLabel[artifact.role]}</span>
            <span className="status-chip">{statusLabel[artifact.status]}</span>
          </div>

          <div>
            <p className="artifact-kicker">Stage {index + 1}</p>
            <h2 className="artifact-title">{artifact.title}</h2>
          </div>
        </div>
      </div>

      <div className="artifact-summary-band">
        <div>
          <p className="artifact-band-label">요약</p>
          <p className="artifact-band-copy">{artifact.summary}</p>
        </div>
      </div>

      <div className="artifact-lines">
        {displayedContent.map((item, itemIndex) => (
          <article key={`${artifact.id}_${itemIndex}`} className="artifact-line artifact-line-v2">
            <span className="artifact-line-index">{itemIndex + 1}</span>
            <p>{item}</p>
          </article>
        ))}
      </div>

      {showMoreButton && (
        <div className="artifact-card-footer">
          <button
            className="text-sm font-medium text-[#4F46E5] hover:text-indigo-700"
            onClick={() => setExpanded(!expanded)}
            type="button"
          >
            {expanded ? "축소" : `더 보기 (${artifact.content.length - 5}개 더)`}
          </button>
        </div>
      )}
    </article>
  );
}
