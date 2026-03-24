/**
 * 웹 검색 유틸리티
 * 1차: Tavily API — 실패하거나 사용량 초과면
 * 2차: Serper.dev API (Google Search) 로 자동 폴백
 */

import { searchWebWithSerper } from "./serper";

export type TavilySearchResult = {
  title: string;
  url: string;
  content: string;
  score: number;
};

export type TavilySearchResponse = {
  query: string;
  results: TavilySearchResult[];
  answer?: string;
};

/**
 * Tavily API로 웹 검색을 수행합니다.
 * 실패하면 Serper.dev로 자동 폴백합니다.
 */
async function searchWithTavily(
  query: string,
  maxResults: number
): Promise<TavilySearchResponse | null> {
  const apiKey = process.env.TAVILY_API_KEY;

  if (!apiKey) {
    console.warn("[Tavily] TAVILY_API_KEY가 설정되지 않았습니다.");
    return null;
  }

  const response = await fetch("https://api.tavily.com/search", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      query,
      max_results: maxResults,
      search_depth: "advanced",
      include_answer: true,
      include_raw_content: false,
    }),
  });

  if (!response.ok) {
    // 429 = 사용량 초과, 401 = 키 만료 등
    const errorText = await response.text().catch(() => "");
    console.warn(
      `[Tavily] 검색 실패 (${response.status}): ${errorText.slice(0, 100)}`
    );
    return null;
  }

  const data = await response.json();
  return data as TavilySearchResponse;
}

/**
 * 웹 검색을 수행합니다. Tavily → Serper.dev 순서로 시도합니다.
 * 두 곳 모두 실패해도 워크플로우는 계속 진행됩니다.
 */
export async function searchWeb(
  query: string,
  maxResults = 5
): Promise<TavilySearchResponse | null> {
  // 1차 시도: Tavily
  try {
    const tavilyResult = await searchWithTavily(query, maxResults);
    if (tavilyResult && tavilyResult.results.length > 0) {
      console.log(`[Search] Tavily 검색 성공: ${tavilyResult.results.length}건`);
      return tavilyResult;
    }
    console.warn("[Search] Tavily 결과 없음 — Serper.dev 폴백 시도");
  } catch (error) {
    console.warn("[Search] Tavily 오류 — Serper.dev 폴백 시도:", error);
  }

  // 2차 시도: Serper.dev
  try {
    const serperResult = await searchWebWithSerper(query, maxResults);
    if (serperResult && serperResult.results.length > 0) {
      console.log(`[Search] Serper 폴백 검색 성공: ${serperResult.results.length}건`);
      return serperResult;
    }
    console.warn("[Search] Serper 결과도 없음 — 검색 없이 진행");
  } catch (error) {
    console.warn("[Search] Serper 오류 — 검색 없이 진행:", error);
  }

  return null;
}

/**
 * 검색 결과를 LLM 프롬프트에 삽입할 텍스트로 포맷합니다.
 */
export function formatSearchResultsForPrompt(
  result: TavilySearchResponse | null
): string {
  if (!result || result.results.length === 0) return "";

  const lines: string[] = [
    `[실시간 웹 검색 결과: "${result.query}"]`,
    "",
  ];

  if (result.answer) {
    lines.push(`요약: ${result.answer}`, "");
  }

  result.results.slice(0, 5).forEach((r, i) => {
    lines.push(`${i + 1}. ${r.title}`);
    lines.push(`   출처: ${r.url}`);
    lines.push(
      `   내용: ${r.content.slice(0, 300)}${r.content.length > 300 ? "..." : ""}`
    );
    lines.push("");
  });

  return lines.join("\n");
}
