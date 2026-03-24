/**
 * generatePptx.ts — Professional Research Report PPT Generator
 *
 * Design system: "Midnight Executive"
 *   Navy `1E2761` dominates (60%), Ice blue `CADCFC` supports, Gold `E8C547` accents
 *   Dark cover + conclusion / light content slides (sandwich structure)
 *   Visual motif: gold circle badge on section headers, carried through every slide
 *
 * Priority:
 *   1. researchSynthesis present → research report slides (real data)
 *   2. fallback → artifact-based slides
 */

import PptxGenJS from "pptxgenjs";
import { createWorkflowExportBase } from "@/lib/workflows/exportArtifacts";
import { type WorkflowRun, type Artifact } from "@/lib/types";
import type { ResearchSynthesisResult } from "@/lib/llm/openai-client";

// ── Design Tokens ─────────────────────────────────────────────────────────────

const PAL = {
  navy:    "1E2761",   // primary — dominant dark
  navyDim: "151D52",   // deeper for overlays
  navyMid: "2D3A80",   // mid-tone navy
  ice:     "CADCFC",   // supporting light blue
  gold:    "E8C547",   // accent
  goldDim: "C9A92E",   // darker gold
  white:   "FFFFFF",
  bg:      "F5F7FD",   // slide background (cool off-white)
  bgCard:  "EBF0FF",   // subtle card tint
  text:    "1A1A2E",   // body text
  muted:   "8890B0",   // secondary text
};

const FONT = {
  head: "Trebuchet MS",
  body: "Calibri",
};

const W = 13.33; // slide width inches
const H = 7.5;   // slide height inches

// ── Helpers ───────────────────────────────────────────────────────────────────

function pageNum(slide: PptxGenJS.Slide, cur: number, total: number) {
  slide.addText(`${cur} / ${total}`, {
    x: W - 1.2, y: H - 0.38, w: 1.0, h: 0.28,
    fontSize: 9, color: PAL.muted, align: "right", fontFace: FONT.body,
  });
}

function goldBadge(
  slide: PptxGenJS.Slide,
  pptx: PptxGenJS,
  label: string,
  x: number, y: number, size = 0.52,
) {
  slide.addShape(pptx.ShapeType.ellipse, {
    x, y, w: size, h: size,
    fill: { color: PAL.gold },
    line: { color: PAL.gold },
  });
  slide.addText(label, {
    x, y: y + 0.02, w: size, h: size - 0.04,
    fontSize: size > 0.5 ? 16 : 13,
    bold: true, color: PAL.navy, align: "center", valign: "middle",
    fontFace: FONT.head,
  });
}

function goldSquareBullet(slide: PptxGenJS.Slide, pptx: PptxGenJS, x: number, y: number) {
  slide.addShape(pptx.ShapeType.rect, {
    x, y, w: 0.1, h: 0.1,
    fill: { color: PAL.gold },
    line: { color: PAL.gold },
  });
}

// ── Research Report PPT ───────────────────────────────────────────────────────

function buildResearchPptx(
  pptx: PptxGenJS,
  synthesis: ResearchSynthesisResult,
  companyName: string,
  task: string,
  createdAt: string | Date,
) {
  const dateStr = new Date(createdAt).toLocaleDateString("ko-KR", {
    year: "numeric", month: "long", day: "numeric",
  });
  const hasConcl = synthesis.conclusion.length > 0;
  const total = 2 + synthesis.sections.length + (hasConcl ? 1 : 0);

  // ── Slide 1: Cover (dark) ─────────────────────────────────────────────────
  {
    const s = pptx.addSlide();
    s.background = { color: PAL.navy };

    // Decorative large circle — bottom-right corner, partially off-slide
    s.addShape(pptx.ShapeType.ellipse, {
      x: 9.8, y: 3.8, w: 5.5, h: 5.5,
      fill: { color: PAL.navyMid, transparency: 60 },
      line: { color: PAL.navyMid, transparency: 60 },
    });
    // Smaller accent circle — overlapping
    s.addShape(pptx.ShapeType.ellipse, {
      x: 11.2, y: 5.0, w: 3.0, h: 3.0,
      fill: { color: PAL.gold, transparency: 80 },
      line: { color: PAL.gold, transparency: 80 },
    });

    // Gold top accent bar (thin)
    s.addShape(pptx.ShapeType.rect, {
      x: 0, y: 0, w: 4.5, h: 0.1,
      fill: { color: PAL.gold },
      line: { color: PAL.gold },
    });

    // Eyebrow label
    s.addText("조사 보고서", {
      x: 0.75, y: 0.55, w: 8, h: 0.4,
      fontSize: 13, color: PAL.ice, fontFace: FONT.head,
      bold: false, charSpacing: 3,
    });

    // Main title
    s.addText(synthesis.reportTitle, {
      x: 0.75, y: 1.1, w: 9.2, h: 2.6,
      fontSize: 38, bold: true, color: PAL.white,
      fontFace: FONT.head, valign: "top",
      charSpacing: -0.5,
    });

    // Summary subtitle
    s.addText(synthesis.summary, {
      x: 0.75, y: 4.0, w: 8.8, h: 1.4,
      fontSize: 15, color: PAL.ice, fontFace: FONT.body,
      italic: true, valign: "top",
    });

    // Bottom meta
    s.addText(`${companyName}  ·  ${dateStr}`, {
      x: 0.75, y: 6.8, w: 9, h: 0.35,
      fontSize: 11, color: PAL.muted, fontFace: FONT.body,
    });
  }

  // ── Slide 2: Table of Contents ────────────────────────────────────────────
  {
    const s = pptx.addSlide();
    s.background = { color: PAL.bg };

    // Right panel (decorative dark side)
    s.addShape(pptx.ShapeType.rect, {
      x: W - 3.4, y: 0, w: 3.4, h: H,
      fill: { color: PAL.navy },
      line: { color: PAL.navy },
    });

    // Right panel: summary text
    s.addText("조사 개요", {
      x: W - 3.1, y: 0.6, w: 2.8, h: 0.4,
      fontSize: 11, color: PAL.gold, fontFace: FONT.head,
      bold: true, charSpacing: 2,
    });
    s.addText(synthesis.summary, {
      x: W - 3.1, y: 1.15, w: 2.8, h: 4.5,
      fontSize: 12, color: PAL.ice, fontFace: FONT.body,
      valign: "top",
    });

    // TOC title
    s.addText("목차", {
      x: 0.7, y: 0.55, w: 8.5, h: 0.7,
      fontSize: 34, bold: true, color: PAL.navy, fontFace: FONT.head,
    });

    // Section items
    const items = [
      ...synthesis.sections.map((sec, i) => ({ num: `${i + 1}`, label: sec.title })),
      ...(hasConcl ? [{ num: "✦", label: "결론 및 시사점" }] : []),
    ];

    items.forEach((item, i) => {
      const y = 1.55 + i * 0.82;

      // Alternating row bg
      if (i % 2 === 0) {
        s.addShape(pptx.ShapeType.rect, {
          x: 0.55, y: y - 0.08, w: 9.0, h: 0.72,
          fill: { color: PAL.bgCard, transparency: 30 },
          line: { color: PAL.bgCard, transparency: 30 },
        });
      }

      // Badge
      const isConclusion = item.num === "✦";
      s.addShape(pptx.ShapeType.ellipse, {
        x: 0.65, y: y, w: 0.48, h: 0.48,
        fill: { color: isConclusion ? PAL.goldDim : PAL.navy },
        line: { color: isConclusion ? PAL.goldDim : PAL.navy },
      });
      s.addText(item.num, {
        x: 0.65, y: y + 0.01, w: 0.48, h: 0.46,
        fontSize: isConclusion ? 13 : 14,
        bold: true, color: PAL.white,
        align: "center", valign: "middle", fontFace: FONT.head,
      });

      s.addText(item.label, {
        x: 1.3, y: y + 0.03, w: 8.1, h: 0.44,
        fontSize: 16, color: PAL.text, fontFace: FONT.head, bold: !isConclusion,
        valign: "middle",
      });
    });

    pageNum(s, 2, total);
  }

  // ── Section Slides ────────────────────────────────────────────────────────
  synthesis.sections.forEach((section, i) => {
    const s = pptx.addSlide();
    s.background = { color: PAL.bg };

    // Header band (full width, navy)
    const HEADER_H = 1.45;
    s.addShape(pptx.ShapeType.rect, {
      x: 0, y: 0, w: W, h: HEADER_H,
      fill: { color: PAL.navy },
      line: { color: PAL.navy },
    });

    // Gold accent strip on left edge of header
    s.addShape(pptx.ShapeType.rect, {
      x: 0, y: 0, w: 0.18, h: HEADER_H,
      fill: { color: PAL.gold },
      line: { color: PAL.gold },
    });

    // Section badge (gold circle)
    goldBadge(s, pptx, `${i + 1}`, 0.42, 0.38, 0.62);

    // Section title
    s.addText(section.title, {
      x: 1.22, y: 0.22, w: W - 1.6, h: 0.65,
      fontSize: 24, bold: true, color: PAL.white,
      fontFace: FONT.head, valign: "middle",
    });

    // Goal subtitle in header
    s.addText(synthesis.reportTitle, {
      x: 1.22, y: 0.95, w: W - 1.6, h: 0.35,
      fontSize: 11, color: PAL.ice, fontFace: FONT.body,
    });

    // Content bullets
    const points = section.points.slice(0, 6);
    const START_Y = HEADER_H + 0.28;
    const AVAILABLE_H = H - START_Y - 0.5; // leave 0.5" bottom margin
    const ROW_H = Math.min(AVAILABLE_H / Math.max(points.length, 1), 1.45);

    points.forEach((pt, pi) => {
      const y = START_Y + pi * ROW_H;

      // Row bg on alternate items
      if (pi % 2 === 0) {
        s.addShape(pptx.ShapeType.rect, {
          x: 0.4, y: y - 0.08, w: W - 0.8, h: ROW_H - 0.1,
          fill: { color: PAL.bgCard, transparency: 50 },
          line: { color: PAL.bgCard, transparency: 80 },
        });
      }

      // Gold square bullet
      goldSquareBullet(s, pptx, 0.62, y + 0.15);

      // Point text
      s.addText(pt, {
        x: 0.9, y: y, w: W - 1.35, h: ROW_H - 0.05,
        fontSize: points.length <= 4 ? 14 : 13,
        color: PAL.text, fontFace: FONT.body,
        valign: "middle",
      });
    });

    pageNum(s, 3 + i, total);
  });

  // ── Conclusion Slide (dark) ───────────────────────────────────────────────
  if (hasConcl) {
    const s = pptx.addSlide();
    s.background = { color: PAL.navyDim };

    // Decorative elements
    s.addShape(pptx.ShapeType.ellipse, {
      x: -1.5, y: -1.5, w: 4.5, h: 4.5,
      fill: { color: PAL.navyMid, transparency: 50 },
      line: { color: PAL.navyMid, transparency: 50 },
    });
    s.addShape(pptx.ShapeType.ellipse, {
      x: 10.5, y: 5.5, w: 3.5, h: 3.5,
      fill: { color: PAL.gold, transparency: 85 },
      line: { color: PAL.gold, transparency: 85 },
    });

    // Gold side accent bar
    s.addShape(pptx.ShapeType.rect, {
      x: 0, y: 0, w: 0.2, h: H,
      fill: { color: PAL.gold },
      line: { color: PAL.gold },
    });

    // Label
    s.addText("결론 및 시사점", {
      x: 0.6, y: 0.45, w: 9, h: 0.55,
      fontSize: 14, color: PAL.gold, fontFace: FONT.head,
      bold: true, charSpacing: 2,
    });

    // Title
    s.addText(synthesis.reportTitle, {
      x: 0.6, y: 1.05, w: 9.5, h: 0.7,
      fontSize: 26, bold: true, color: PAL.white, fontFace: FONT.head,
    });

    // Conclusion points
    const START_Y = 2.1;
    const AVAILABLE_H = H - START_Y - 0.5;
    const ROW_H = Math.min(AVAILABLE_H / Math.max(synthesis.conclusion.length, 1), 1.6);

    synthesis.conclusion.forEach((c, ci) => {
      const y = START_Y + ci * ROW_H;

      // Gold square bullet
      s.addShape(pptx.ShapeType.rect, {
        x: 0.6, y: y + 0.18, w: 0.12, h: 0.12,
        fill: { color: PAL.gold }, line: { color: PAL.gold },
      });

      s.addText(c, {
        x: 0.9, y, w: W - 1.3, h: ROW_H - 0.05,
        fontSize: 15, color: PAL.white, fontFace: FONT.body,
        valign: "middle",
      });
    });

    pageNum(s, total, total);
  }
}

// ── Artifact-based PPT (fallback) ─────────────────────────────────────────────

const typeLabel: Record<Artifact["type"], string> = {
  brief: "브리프",
  "execution-plan": "실행 계획",
  checklist: "체크리스트",
  review: "리뷰",
};
const typeIcon: Record<Artifact["type"], string> = {
  brief: "01", "execution-plan": "02", checklist: "03", review: "04",
};

function buildArtifactPptx(
  pptx: PptxGenJS,
  base: ReturnType<typeof createWorkflowExportBase>,
) {
  const dateStr = new Date(base.createdAt).toLocaleDateString("ko-KR");
  const total = 2 + base.artifacts.length;

  // Cover
  {
    const s = pptx.addSlide();
    s.background = { color: PAL.navy };
    s.addShape(pptx.ShapeType.ellipse, {
      x: 9.8, y: 3.8, w: 5.5, h: 5.5,
      fill: { color: PAL.navyMid, transparency: 60 },
      line: { color: PAL.navyMid, transparency: 60 },
    });
    s.addShape(pptx.ShapeType.rect, {
      x: 0, y: 0, w: 4.5, h: 0.1,
      fill: { color: PAL.gold }, line: { color: PAL.gold },
    });
    s.addText(base.companyName, {
      x: 0.75, y: 0.55, w: 8.5, h: 0.4,
      fontSize: 13, color: PAL.ice, fontFace: FONT.head, charSpacing: 3,
    });
    s.addText(base.goalTitle, {
      x: 0.75, y: 1.1, w: 9.2, h: 2.5,
      fontSize: 38, bold: true, color: PAL.white, fontFace: FONT.head,
    });
    s.addText(base.task, {
      x: 0.75, y: 4.0, w: 8.8, h: 1.4,
      fontSize: 15, color: PAL.ice, fontFace: FONT.body, italic: true,
    });
    s.addText(`${dateStr}  ·  ${base.status}`, {
      x: 0.75, y: 6.8, w: 9, h: 0.35,
      fontSize: 11, color: PAL.muted, fontFace: FONT.body,
    });
  }

  // TOC
  {
    const s = pptx.addSlide();
    s.background = { color: PAL.bg };
    s.addShape(pptx.ShapeType.rect, {
      x: W - 3.4, y: 0, w: 3.4, h: H,
      fill: { color: PAL.navy }, line: { color: PAL.navy },
    });
    s.addText("워크플로우 결과", {
      x: W - 3.1, y: 0.65, w: 2.8, h: 0.4,
      fontSize: 11, color: PAL.gold, fontFace: FONT.head, bold: true, charSpacing: 2,
    });
    s.addText("목차", {
      x: 0.7, y: 0.55, w: 8.5, h: 0.7,
      fontSize: 34, bold: true, color: PAL.navy, fontFace: FONT.head,
    });
    base.artifacts.forEach((a, i) => {
      const y = 1.6 + i * 0.9;
      if (i % 2 === 0) {
        s.addShape(pptx.ShapeType.rect, {
          x: 0.55, y: y - 0.08, w: 9.0, h: 0.75,
          fill: { color: PAL.bgCard, transparency: 30 },
          line: { color: PAL.bgCard, transparency: 30 },
        });
      }
      s.addShape(pptx.ShapeType.ellipse, {
        x: 0.65, y, w: 0.48, h: 0.48,
        fill: { color: PAL.navy }, line: { color: PAL.navy },
      });
      s.addText(typeIcon[a.type], {
        x: 0.65, y: y + 0.01, w: 0.48, h: 0.46,
        fontSize: 14, bold: true, color: PAL.white,
        align: "center", valign: "middle", fontFace: FONT.head,
      });
      s.addText(`${typeLabel[a.type]}  —  ${a.title}`, {
        x: 1.3, y: y + 0.03, w: 8.2, h: 0.44,
        fontSize: 16, color: PAL.text, fontFace: FONT.head, valign: "middle",
      });
    });
    pageNum(s, 2, total);
  }

  // Artifact slides
  base.artifacts.forEach((artifact, index) => {
    const s = pptx.addSlide();
    s.background = { color: PAL.bg };

    const HEADER_H = 1.45;
    s.addShape(pptx.ShapeType.rect, {
      x: 0, y: 0, w: W, h: HEADER_H,
      fill: { color: PAL.navy }, line: { color: PAL.navy },
    });
    s.addShape(pptx.ShapeType.rect, {
      x: 0, y: 0, w: 0.18, h: HEADER_H,
      fill: { color: PAL.gold }, line: { color: PAL.gold },
    });
    goldBadge(s, pptx, typeIcon[artifact.type], 0.42, 0.38, 0.62);
    s.addText(`${typeLabel[artifact.type]}  —  ${artifact.title}`, {
      x: 1.22, y: 0.22, w: W - 1.6, h: 0.65,
      fontSize: 22, bold: true, color: PAL.white, fontFace: FONT.head, valign: "middle",
    });
    s.addText(artifact.summary, {
      x: 1.22, y: 0.95, w: W - 1.6, h: 0.38,
      fontSize: 11, color: PAL.ice, fontFace: FONT.body, italic: true,
    });

    const points = artifact.content.slice(0, 6);
    const ROW_H = points.length <= 4 ? 1.0 : points.length <= 5 ? 0.9 : 0.8;
    const START_Y = HEADER_H + 0.28;

    points.forEach((item, pi) => {
      const y = START_Y + pi * ROW_H;
      if (pi % 2 === 0) {
        s.addShape(pptx.ShapeType.rect, {
          x: 0.4, y: y - 0.08, w: W - 0.8, h: ROW_H - 0.1,
          fill: { color: PAL.bgCard, transparency: 50 },
          line: { color: PAL.bgCard, transparency: 80 },
        });
      }
      goldSquareBullet(s, pptx, 0.62, y + 0.14);
      s.addText(item, {
        x: 0.9, y, w: W - 1.35, h: ROW_H - 0.05,
        fontSize: points.length <= 4 ? 14 : 13,
        color: PAL.text, fontFace: FONT.body, valign: "middle",
      });
    });

    if (artifact.content.length > 6) {
      s.addText(`+ ${artifact.content.length - 6}개 항목 더 있음`, {
        x: 0.9, y: START_Y + 6 * ROW_H, w: 6, h: 0.3,
        fontSize: 11, color: PAL.muted, fontFace: FONT.body, italic: true,
      });
    }

    pageNum(s, index + 3, total);
  });
}

// ── Public API ────────────────────────────────────────────────────────────────

export async function generatePptxBuffer(
  run: WorkflowRun,
  companyName?: string,
  goalTitle?: string,
  researchSynthesis?: ResearchSynthesisResult,
): Promise<Buffer> {
  const base = createWorkflowExportBase(run, companyName, goalTitle);
  const pptx = new PptxGenJS();
  pptx.layout = "LAYOUT_WIDE";

  if (researchSynthesis && researchSynthesis.sections.length > 0) {
    buildResearchPptx(pptx, researchSynthesis, base.companyName, base.task, base.createdAt);
  } else {
    buildArtifactPptx(pptx, base);
  }

  const data = await pptx.write({ outputType: "nodebuffer" });
  return data as Buffer;
}
