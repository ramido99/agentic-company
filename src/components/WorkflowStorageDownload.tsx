"use client";

import { useEffect, useState } from "react";

type OutputFormat = "md" | "pptx" | "xlsx" | "pdf";

const FORMAT_LABELS: Record<OutputFormat, { label: string; icon: string; ext: string }> = {
  md: { label: "Markdown", icon: "📄", ext: ".md" },
  pptx: { label: "PowerPoint", icon: "📑", ext: ".pptx" },
  xlsx: { label: "Excel", icon: "📋", ext: ".xlsx" },
  pdf: { label: "PDF Report", icon: "📰", ext: ".html" },
};

interface WorkflowStorageDownloadProps {
  runId: string;
}

export function WorkflowStorageDownload({ runId }: WorkflowStorageDownloadProps) {
  const [formats, setFormats] = useState<OutputFormat[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [downloading, setDownloading] = useState<OutputFormat | null>(null);

  useEffect(() => {
    fetch(`/api/workflows/download?runId=${runId}`)
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data.formats)) setFormats(data.formats);
      })
      .catch(() => {})
      .finally(() => setLoaded(true));
  }, [runId]);

  const download = async (format: OutputFormat) => {
    setDownloading(format);
    try {
      const res = await fetch(`/api/workflows/download?runId=${runId}&format=${format}`);
      const data = await res.json();
      if (data.url) {
        const info = FORMAT_LABELS[format];
        const filename = `workflow-results-${runId.slice(-6)}${info.ext}`;
        const a = document.createElement("a");
        a.href = data.url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      }
    } catch {
      alert("다운로드에 실패했습니다.");
    } finally {
      setDownloading(null);
    }
  };

  if (!loaded) {
    return <p style={{ fontSize: "13px", color: "var(--text-faint)" }}>파일 목록 확인 중...</p>;
  }

  if (formats.length === 0) {
    return (
      <p style={{ fontSize: "13px", color: "var(--text-faint)" }}>
        생성된 파일이 없습니다. 출력 스킬(PPT·Excel)을 에이전트에 배정한 뒤 워크플로를 다시 실행하세요.
      </p>
    );
  }

  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
        {formats.map((format) => {
          const info = FORMAT_LABELS[format];
          if (!info) return null;
          return (
            <button
              key={format}
              onClick={() => download(format)}
              disabled={downloading === format}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                padding: "7px 14px",
                borderRadius: "7px",
                border: "1.5px solid var(--border)",
                background: "transparent",
                color: "var(--text-muted)",
                fontSize: "13px",
                fontWeight: 600,
                cursor: downloading === format ? "not-allowed" : "pointer",
                opacity: downloading === format ? 0.6 : 1,
                transition: "all 0.15s ease",
              }}
            >
              <span>{info.icon}</span>
              <span>{info.label}</span>
              <span style={{ fontSize: "11px", color: "var(--text-faint)" }}>{info.ext}</span>
            </button>
          );
        })}
    </div>
  );
}
