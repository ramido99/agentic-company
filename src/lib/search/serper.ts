/**
 * Serper.dev 웹 검색 유틸리티
 * Tavily 사용량 초과 또는 실패 시 폴백으로 사용합니다.
 */

import type { TavilySearchResponse, TavilySearchResult } from "./tavily";

type SerperOrganicResult = {
  title: string;
  link: string;
  snippet: string;
  position: number;
};

type SerperResponse = {
  organic?: SerperOrganicResult[];
  answerBox?: { answer?: string; snippet?: string };
};

/**
 * Serper API로 웹 검색을 수행하고, Tavily와 동일한 형식으로 반환합니다.
 */
export async function searchWebWithSerper(
  query: string,
  maxResults = 5
): Promise<TavilySearchResponse | null> {
  const apiKey = process.env.SERPER_API_KEY;

  if (!apiKey) {
    console.warn("[Serper] SERPER_API_KEY가 설정되지 않아 폴백 검색을 건너뜁니다.");
    return null;
  }

  try {
    const response = await fetch("https://google.serper.dev/search", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-API-KEY": apiKey,
      },
      body: JSON.stringify({
        q: query,
        num: maxResults,
        gl: "kr",
        hl: "ko",
      }),
    });

    if (!response.ok) {
      console.warn(`[Serper] 검색 요청 실패: ${response.status} ${response.statusText}`);
      return null;
    }

    const data: SerperResponse = await response.json();

    const results: TavilySearchResult[] = (data.organic ?? [])
      .slice(0, maxResults)
      .map((r, i) => ({
        title: r.title,
        url: r.link,
        content: r.snippet,
        score: 1 - i * 0.1, // 순위 기반 점수 근사값
      }));

    const answer =
      data.answerBox?.answer ?? data.answerBox?.snippet ?? undefined;

    return { query, results, answer };
  } catch (error) {
    console.warn("[Serper] 검색 중 오류 발생:", error);
    return null;
  }
}
