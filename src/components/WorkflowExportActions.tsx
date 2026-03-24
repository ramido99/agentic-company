"use client";

import { useState } from "react";

import { WorkflowRun } from "@/lib/types";
import { buildWorkflowExportMarkdown, buildWorkflowExportText } from "@/lib/workflows/exportArtifacts";
import { Button } from "@/components/ui/Button";

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9가-힣]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

function downloadFile(filename: string, content: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

export function WorkflowExportActions({
  run,
  companyName,
  goalTitle,
}: {
  run: WorkflowRun;
  companyName?: string;
  goalTitle?: string;
}) {
  const [copied, setCopied] = useState(false);
  const baseName = slugify((goalTitle ?? run.task) || "workflow-export");
  const markdown = buildWorkflowExportMarkdown(run, companyName, goalTitle);
  const text = buildWorkflowExportText(run, companyName, goalTitle);

  async function handleCopy() {
    await navigator.clipboard.writeText(markdown);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  }

  return (
    <div className="flex flex-wrap gap-2">
      <Button
        variant="secondary"
        size="sm"
        onClick={handleCopy}
      >
        {copied ? "복사됨" : "클립보드에 복사"}
      </Button>
      <Button
        variant="secondary"
        size="sm"
        onClick={() => downloadFile(`${baseName || "workflow-result"}.md`, markdown, "text/markdown")}
      >
        마크다운 다운로드
      </Button>
      <Button
        variant="secondary"
        size="sm"
        onClick={() => downloadFile(`${baseName || "workflow-result"}.txt`, text, "text/plain")}
      >
        TXT 다운로드
      </Button>
    </div>
  );
}
