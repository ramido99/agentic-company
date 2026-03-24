import OpenAI, { AzureOpenAI } from "openai";

export type LLMClientOptions = {
  apiKey?: string;
  apiEndpoint?: string;
  model?: string;
};

type StrategistPromptInput = {
  companyName: string;
  companyIdea: string;
  goalTitle: string;
  task: string;
  agentName?: string;
  agentHeadline?: string;
  skillBoosts?: string[];
  searchResults?: string; // 실시간 웹 검색 결과 (Tavily)
};

export type StrategistLLMResult = {
  title: string;
  summary: string;
  content: string[];
  usage: {
    provider: "openai";
    model: string;
    inputTokens: number;
    outputTokens: number;
    totalTokens: number;
    responseId?: string;
  };
};

function isAzureEndpoint(endpoint: string): boolean {
  return (
    endpoint.includes("openai.azure.com") ||
    endpoint.includes("cognitiveservices.azure.com")
  );
}

function buildClient(options?: LLMClientOptions): OpenAI | AzureOpenAI {
  const apiKey =
    options?.apiKey ||
    process.env.AZURE_OPENAI_API_KEY ||
    process.env.OPENAI_API_KEY;

  if (!apiKey) {
    throw new Error(
      "API 키가 설정되지 않았습니다. Settings 페이지에서 API 키를 입력하거나 .env 파일에 OPENAI_API_KEY 또는 AZURE_OPENAI_API_KEY를 설정해 주세요.",
    );
  }

  const endpoint =
    options?.apiEndpoint ||
    process.env.AZURE_OPENAI_ENDPOINT ||
    process.env.OPENAI_API_ENDPOINT;

  // Azure OpenAI 엔드포인트 자동 감지
  if (endpoint && isAzureEndpoint(endpoint)) {
    const apiVersion =
      process.env.AZURE_OPENAI_API_VERSION || "2024-08-01-preview";
    return new AzureOpenAI({ apiKey, endpoint, apiVersion });
  }

  // 일반 OpenAI 또는 호환 엔드포인트
  const baseURL =
    endpoint && endpoint !== "https://api.openai.com/v1" ? endpoint : undefined;

  return new OpenAI({ apiKey, baseURL });
}

export async function generateStrategistBriefWithLLM(
  input: StrategistPromptInput,
  llmOptions?: LLMClientOptions,
): Promise<StrategistLLMResult> {
  const model =
    llmOptions?.model ||
    process.env.AZURE_OPENAI_DEPLOYMENT ||
    process.env.OPENAI_MODEL ||
    "gpt-4o-mini";

  const skillSection =
    input.skillBoosts && input.skillBoosts.length > 0
      ? "\n\n[배정된 스킬 역량]\n" +
        input.skillBoosts.map((b) => `- ${b}`).join("\n")
      : "";

  const searchSection = input.searchResults
    ? `\n\n${input.searchResults}`
    : "";

  const client = buildClient(llmOptions);

  const response = await client.chat.completions.create({
    model,
    messages: [
      {
        role: "system",
        content:
          "너는 SaaS 운영 워크플로우의 strategist 역할이다. " +
          "반드시 한국어로 답하고, 짧고 선명한 제품 문장으로 작성하라. " +
          "실시간 웹 검색 결과가 제공된 경우, 해당 내용을 반드시 분석에 반영하여 구체적이고 사실에 기반한 브리프를 작성하라. " +
          "출력은 반드시 다음 JSON 형식만 반환해야 한다: " +
          '{ "title": string, "summary": string, "content": [string, string, string, string] }. ' +
          "content는 정확히 4개 항목: 브리프(검색 결과 핵심 반영), 목표, 작업 정의, 성공 기준." +
          skillSection,
      },
      {
        role: "user",
        content:
          `회사명: ${input.companyName}\n` +
          `사업 아이디어: ${input.companyIdea}\n` +
          `목표: ${input.goalTitle}\n` +
          `작업: ${input.task}\n` +
          `배정된 전략가 이름: ${input.agentName ?? "전략가"}\n` +
          `배정된 전략가 설명: ${input.agentHeadline ?? "회사 목표를 브리프로 정리하는 역할"}` +
          searchSection +
          "\n\n위 정보를 바탕으로 JSON만 반환하라.",
      },
    ],
    response_format: { type: "json_object" },
    temperature: 0.3,
  });

  const rawText = response.choices[0]?.message?.content ?? "{}";
  const parsed = JSON.parse(rawText);

  const inputTokens = response.usage?.prompt_tokens ?? 0;
  const outputTokens = response.usage?.completion_tokens ?? 0;

  return {
    title: parsed.title ?? "브리프",
    summary: parsed.summary ?? "",
    content: Array.isArray(parsed.content) ? parsed.content.slice(0, 4) : [],
    usage: {
      provider: "openai",
      model,
      inputTokens,
      outputTokens,
      totalTokens: inputTokens + outputTokens,
      responseId: response.id,
    },
  };
}

// ── Operator ─────────────────────────────────────────────────────────────────

type OperatorPlanPromptInput = {
  briefTitle: string;
  briefContent: string[];
  agentName?: string;
  agentHeadline?: string;
  skillBoosts?: string[];
};

export type OperatorLLMResult = {
  title: string;
  summary: string;
  content: string[];
  usage: {
    provider: "openai";
    model: string;
    inputTokens: number;
    outputTokens: number;
    totalTokens: number;
    responseId?: string;
  };
};

export async function generateOperatorPlanWithLLM(
  input: OperatorPlanPromptInput,
  llmOptions?: LLMClientOptions,
): Promise<OperatorLLMResult> {
  const model =
    llmOptions?.model ||
    process.env.AZURE_OPENAI_DEPLOYMENT ||
    process.env.OPENAI_MODEL ||
    "gpt-4o-mini";

  const skillSection =
    input.skillBoosts && input.skillBoosts.length > 0
      ? "\n\n[배정된 스킬 역량]\n" + input.skillBoosts.map((b) => `- ${b}`).join("\n")
      : "";

  const client = buildClient(llmOptions);

  const response = await client.chat.completions.create({
    model,
    messages: [
      {
        role: "system",
        content:
          "너는 SaaS 운영 워크플로우의 operator(실행 담당) 역할이다. " +
          "반드시 한국어로 답하고, 실제로 실행 가능한 구체적인 단계로 작성하라. " +
          "출력은 반드시 다음 JSON 형식만 반환해야 한다: " +
          '{ "title": string, "summary": string, "content": [string, string, string, string, string] }. ' +
          "content는 정확히 5개 항목: 각각 실행 단계 1~5. 각 단계는 '단계N: 행동' 형식으로 구체적으로 작성." +
          skillSection,
      },
      {
        role: "user",
        content:
          `전략 브리프 제목: ${input.briefTitle}\n` +
          `브리프 내용:\n${input.briefContent.join("\n")}\n\n` +
          `담당 실행자: ${input.agentName ?? "실행 담당"}\n` +
          `실행자 설명: ${input.agentHeadline ?? "브리프를 실행 계획으로 바꾸는 역할"}\n\n` +
          "위 브리프를 바탕으로 구체적인 실행 계획 5단계를 JSON으로 반환하라.",
      },
    ],
    response_format: { type: "json_object" },
    temperature: 0.3,
  });

  const rawText = response.choices[0]?.message?.content ?? "{}";
  const parsed = JSON.parse(rawText);
  const inputTokens = response.usage?.prompt_tokens ?? 0;
  const outputTokens = response.usage?.completion_tokens ?? 0;

  return {
    title: parsed.title ?? "실행 계획",
    summary: parsed.summary ?? "",
    content: Array.isArray(parsed.content) ? parsed.content.slice(0, 5) : [],
    usage: {
      provider: "openai",
      model,
      inputTokens,
      outputTokens,
      totalTokens: inputTokens + outputTokens,
      responseId: response.id,
    },
  };
}

type OperatorChecklistPromptInput = {
  planTitle: string;
  planContent: string[];
  agentName?: string;
  skillBoosts?: string[];
};

export async function generateOperatorChecklistWithLLM(
  input: OperatorChecklistPromptInput,
  llmOptions?: LLMClientOptions,
): Promise<OperatorLLMResult> {
  const model =
    llmOptions?.model ||
    process.env.AZURE_OPENAI_DEPLOYMENT ||
    process.env.OPENAI_MODEL ||
    "gpt-4o-mini";

  const skillSection =
    input.skillBoosts && input.skillBoosts.length > 0
      ? "\n\n[배정된 스킬 역량]\n" + input.skillBoosts.map((b) => `- ${b}`).join("\n")
      : "";

  const client = buildClient(llmOptions);

  const response = await client.chat.completions.create({
    model,
    messages: [
      {
        role: "system",
        content:
          "너는 SaaS 운영 워크플로우의 operator(실행 담당) 역할이다. " +
          "반드시 한국어로 답하고, 지금 당장 실행할 수 있는 체크리스트를 만들어라. " +
          "출력은 반드시 다음 JSON 형식만 반환해야 한다: " +
          '{ "title": string, "summary": string, "content": [string, string, string, string, string, string] }. ' +
          "content는 정확히 6개 항목: 각각 체크리스트 항목. '☐ 항목 내용' 형식으로 작성." +
          skillSection,
      },
      {
        role: "user",
        content:
          `실행 계획 제목: ${input.planTitle}\n` +
          `실행 계획 내용:\n${input.planContent.join("\n")}\n\n` +
          `담당 실행자: ${input.agentName ?? "실행 담당"}\n\n` +
          "위 실행 계획을 바탕으로 바로 실행 가능한 체크리스트 6개를 JSON으로 반환하라.",
      },
    ],
    response_format: { type: "json_object" },
    temperature: 0.3,
  });

  const rawText = response.choices[0]?.message?.content ?? "{}";
  const parsed = JSON.parse(rawText);
  const inputTokens = response.usage?.prompt_tokens ?? 0;
  const outputTokens = response.usage?.completion_tokens ?? 0;

  return {
    title: parsed.title ?? "체크리스트",
    summary: parsed.summary ?? "",
    content: Array.isArray(parsed.content) ? parsed.content.slice(0, 6) : [],
    usage: {
      provider: "openai",
      model,
      inputTokens,
      outputTokens,
      totalTokens: inputTokens + outputTokens,
      responseId: response.id,
    },
  };
}

// ── Reviewer ──────────────────────────────────────────────────────────────────

type ReviewerPromptInput = {
  briefTitle: string;
  briefContent: string[];
  planTitle: string;
  planContent: string[];
  checklistTitle: string;
  checklistContent: string[];
  agentName?: string;
  agentHeadline?: string;
  skillBoosts?: string[];
};

export async function generateReviewerReviewWithLLM(
  input: ReviewerPromptInput,
  llmOptions?: LLMClientOptions,
): Promise<OperatorLLMResult> {
  const model =
    llmOptions?.model ||
    process.env.AZURE_OPENAI_DEPLOYMENT ||
    process.env.OPENAI_MODEL ||
    "gpt-4o-mini";

  const skillSection =
    input.skillBoosts && input.skillBoosts.length > 0
      ? "\n\n[배정된 스킬 역량]\n" + input.skillBoosts.map((b) => `- ${b}`).join("\n")
      : "";

  const client = buildClient(llmOptions);

  const response = await client.chat.completions.create({
    model,
    messages: [
      {
        role: "system",
        content:
          "너는 SaaS 운영 워크플로우의 reviewer(검토자) 역할이다. " +
          "반드시 한국어로 답하고, 전략 브리프·실행 계획·체크리스트 전체를 검토하여 솔직하고 실용적인 피드백을 제공하라. " +
          "출력은 반드시 다음 JSON 형식만 반환해야 한다: " +
          '{ "title": string, "summary": string, "content": [string, string, string, string, string] }. ' +
          "content는 정확히 5개 항목: 전체 평가, 잘된 점, 보완 필요 사항, 실행 가능성 판단, 최종 권고." +
          skillSection,
      },
      {
        role: "user",
        content:
          `[브리프] ${input.briefTitle}\n${input.briefContent.join("\n")}\n\n` +
          `[실행 계획] ${input.planTitle}\n${input.planContent.join("\n")}\n\n` +
          `[체크리스트] ${input.checklistTitle}\n${input.checklistContent.join("\n")}\n\n` +
          `담당 검토자: ${input.agentName ?? "검토자"}\n` +
          `검토자 설명: ${input.agentHeadline ?? "결과물 품질과 실행 가능성을 검토하는 역할"}\n\n` +
          "위 전체 결과물을 검토하여 JSON으로 반환하라.",
      },
    ],
    response_format: { type: "json_object" },
    temperature: 0.3,
  });

  const rawText = response.choices[0]?.message?.content ?? "{}";
  const parsed = JSON.parse(rawText);
  const inputTokens = response.usage?.prompt_tokens ?? 0;
  const outputTokens = response.usage?.completion_tokens ?? 0;

  return {
    title: parsed.title ?? "리뷰",
    summary: parsed.summary ?? "",
    content: Array.isArray(parsed.content) ? parsed.content.slice(0, 5) : [],
    usage: {
      provider: "openai",
      model,
      inputTokens,
      outputTokens,
      totalTokens: inputTokens + outputTokens,
      responseId: response.id,
    },
  };
}

// ── Research Synthesis ────────────────────────────────────────────────────────

export type ResearchSection = {
  title: string;    // 슬라이드 제목 (e.g. "주요 성과", "시장 트렌드")
  points: string[]; // 핵심 내용 (bullet points)
};

export type ResearchSynthesisResult = {
  reportTitle: string;         // 보고서/PPT 전체 제목
  summary: string;             // 전체 요약 (표지 서브타이틀용)
  sections: ResearchSection[]; // 섹션들 → 각각 PPT 슬라이드 1장
  conclusion: string[];        // 결론/시사점 (마지막 슬라이드)
  usage: {
    provider: "openai";
    model: string;
    inputTokens: number;
    outputTokens: number;
    totalTokens: number;
  };
};

type ResearchSynthesisInput = {
  query: string;
  goalTitle: string;
  task: string;
  companyName: string;
  rawSearchText: string; // formatSearchResultsForPrompt() 결과
};

/**
 * 웹 검색 결과를 분석해 PPT/보고서용 구조화된 섹션으로 합성합니다.
 * 검색 결과가 없으면 null을 반환합니다.
 */
export async function generateResearchSynthesisWithLLM(
  input: ResearchSynthesisInput,
  llmOptions?: LLMClientOptions,
): Promise<ResearchSynthesisResult | null> {
  if (!input.rawSearchText.trim()) return null;

  const model =
    llmOptions?.model ||
    process.env.AZURE_OPENAI_DEPLOYMENT ||
    process.env.OPENAI_MODEL ||
    "gpt-4o-mini";

  const client = buildClient(llmOptions);

  const response = await client.chat.completions.create({
    model,
    messages: [
      {
        role: "system",
        content:
          "너는 웹 검색 결과를 분석해 전문 보고서와 프레젠테이션 슬라이드를 만드는 리서치 분석가다. " +
          "반드시 한국어로 작성하고, 검색 결과에서 실제 데이터·수치·날짜·사건을 최대한 추출해 포함하라. " +
          "추상적인 말 대신 구체적인 사실을 기반으로 작성하라. " +
          "출력은 반드시 다음 JSON 형식만 반환해야 한다:\n" +
          JSON.stringify({
            reportTitle: "string (보고서 제목)",
            summary: "string (전체 요약 1-2문장)",
            sections: [
              { title: "string (섹션 제목)", points: ["string (구체적 사실/수치/분석)"] }
            ],
            conclusion: ["string (결론 및 시사점)"]
          }, null, 2) +
          "\nsections는 3~5개, 각 section의 points는 3~5개의 구체적인 사실 문장. conclusion은 2~4개.",
      },
      {
        role: "user",
        content:
          `조사 주제: ${input.goalTitle}\n` +
          `세부 작업: ${input.task}\n` +
          `관련 회사/조직: ${input.companyName}\n\n` +
          `아래 웹 검색 결과를 분석해 전문 보고서 구조로 합성하라:\n\n` +
          input.rawSearchText,
      },
    ],
    response_format: { type: "json_object" },
    temperature: 0.2,
  });

  const rawText = response.choices[0]?.message?.content ?? "{}";
  let parsed: {
    reportTitle?: string;
    summary?: string;
    sections?: { title?: string; points?: string[] }[];
    conclusion?: string[];
  };

  try {
    parsed = JSON.parse(rawText);
  } catch {
    return null;
  }

  const inputTokens = response.usage?.prompt_tokens ?? 0;
  const outputTokens = response.usage?.completion_tokens ?? 0;

  return {
    reportTitle: parsed.reportTitle ?? input.goalTitle,
    summary: parsed.summary ?? "",
    sections: (parsed.sections ?? []).map((s) => ({
      title: s.title ?? "",
      points: Array.isArray(s.points) ? s.points : [],
    })),
    conclusion: Array.isArray(parsed.conclusion) ? parsed.conclusion : [],
    usage: {
      provider: "openai",
      model,
      inputTokens,
      outputTokens,
      totalTokens: inputTokens + outputTokens,
    },
  };
}
