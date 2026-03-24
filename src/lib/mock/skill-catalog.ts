export type SkillCategory = "분석" | "출력" | "전략" | "운영" | "성장" | "검토";
export type SkillOutputFormat = "pptx" | "xlsx" | "pdf";
export type AgentRoleType = "strategist" | "operator" | "reviewer";

export type SkillCatalogItem = {
  id: string;
  name: string;
  description: string;
  fullDescription: string;
  category: SkillCategory;
  icon: string;
  compatibleRoles: AgentRoleType[];
  outputFormat?: SkillOutputFormat;
  promptBoost: string;
  isPremium: boolean;
};

export const skillCatalog: SkillCatalogItem[] = [

  // ────────────────────────────────────────────
  // 분석 스킬
  // ────────────────────────────────────────────
  {
    id: "skill-market-analysis",
    name: "시장 분석",
    description: "시장 규모, 트렌드, 고객 세그먼트를 체계적으로 분석합니다.",
    fullDescription: "TAM/SAM/SOM 분석, 고객 페르소나 정의, 시장 트렌드 파악을 수행하여 전략적 방향을 강화합니다.",
    category: "분석",
    icon: "📊",
    compatibleRoles: ["strategist"],
    promptBoost: "시장 분석 역량을 활용하여 TAM/SAM/SOM, 고객 세그먼트, 주요 트렌드를 브리프에 포함하세요.",
    isPremium: false,
  },
  {
    id: "skill-competitive-analysis",
    name: "경쟁사 분석",
    description: "경쟁 구도와 차별화 포인트를 분석합니다.",
    fullDescription: "주요 경쟁사 포지셔닝, 강점/약점, 차별화 기회를 분석하여 전략 수립을 지원합니다.",
    category: "분석",
    icon: "🔍",
    compatibleRoles: ["strategist", "reviewer"],
    promptBoost: "경쟁사 분석 역량으로 주요 경쟁자 포지셔닝과 차별화 포인트를 결과물에 반영하세요.",
    isPremium: false,
  },
  {
    id: "skill-risk-assessment",
    name: "리스크 분석",
    description: "실행 과정의 위험 요소를 사전에 식별하고 대응책을 제시합니다.",
    fullDescription: "리스크 매트릭스, 완화 전략, 우선순위를 체계적으로 분석하여 실행 안정성을 높입니다.",
    category: "분석",
    icon: "⚠️",
    compatibleRoles: ["reviewer"],
    promptBoost: "리스크 분석 역량으로 주요 위험 요소와 완화 전략을 검토 결과에 명시하세요.",
    isPremium: false,
  },
  {
    id: "skill-persona-analysis",
    name: "고객 페르소나 분석",
    description: "타겟 고객의 특성, 니즈, 행동 패턴을 구조화합니다.",
    fullDescription: "인터뷰 기반 페르소나 카드, 사용자 목표와 불편점, 의사결정 트리거를 분석하여 전략에 사용자 맥락을 더합니다.",
    category: "분석",
    icon: "👤",
    compatibleRoles: ["strategist"],
    promptBoost: "고객 페르소나 분석 역량으로 핵심 타겟 페르소나 2~3개, 그들의 주요 니즈와 불편점을 결과물에 포함하세요.",
    isPremium: false,
  },
  {
    id: "skill-user-journey",
    name: "사용자 여정 매핑",
    description: "고객이 제품·서비스를 경험하는 전 과정을 단계별로 시각화합니다.",
    fullDescription: "터치포인트, 감정 곡선, 핵심 병목을 단계별로 정리해 UX 개선과 전략 방향을 명확히 합니다.",
    category: "분석",
    icon: "🗺️",
    compatibleRoles: ["strategist", "operator"],
    promptBoost: "사용자 여정 매핑 역량으로 인지→탐색→구매→사용→재구매 단계별 주요 터치포인트와 병목을 결과물에 포함하세요.",
    isPremium: false,
  },
  {
    id: "skill-kpi-design",
    name: "KPI 대시보드 설계",
    description: "목표 달성을 측정할 핵심 지표 체계를 설계합니다.",
    fullDescription: "목표별 측정 가능한 KPI 정의, 수집 방법, 기준값 설정을 통해 실행 성과를 추적할 수 있는 체계를 만듭니다.",
    category: "분석",
    icon: "📈",
    compatibleRoles: ["strategist", "reviewer"],
    promptBoost: "KPI 대시보드 설계 역량으로 핵심 지표 5개 이내, 측정 방법, 목표 기준값을 결과물에 포함하세요.",
    isPremium: false,
  },
  {
    id: "skill-financial-modeling",
    name: "재무 모델링",
    description: "수익·비용 구조와 손익분기를 수치 기반으로 모델링합니다.",
    fullDescription: "매출 추정, 고정비/변동비 분류, 손익분기 시뮬레이션, 시나리오별 재무 전망을 계산해 실행 판단 근거를 제공합니다.",
    category: "분석",
    icon: "💹",
    compatibleRoles: ["reviewer"],
    promptBoost: "재무 모델링 역량으로 예상 매출, 비용 구조, 손익분기 시점 추정치를 검토 결과에 명시하세요.",
    isPremium: true,
  },
  {
    id: "skill-impact-measurement",
    name: "임팩트 측정",
    description: "실행 결과의 정량·정성 임팩트를 평가 기준으로 측정합니다.",
    fullDescription: "목표 달성률, 정성 피드백 분류, 비교군 대비 효과를 측정하여 다음 실행 사이클의 인사이트를 도출합니다.",
    category: "분석",
    icon: "🎯",
    compatibleRoles: ["reviewer"],
    promptBoost: "임팩트 측정 역량으로 정량 성과 지표, 정성 피드백 요약, 다음 사이클 개선 제안을 검토 결과에 포함하세요.",
    isPremium: false,
  },

  // ────────────────────────────────────────────
  // 전략 스킬
  // ────────────────────────────────────────────
  {
    id: "skill-swot",
    name: "SWOT 분석",
    description: "강점·약점·기회·위협을 구조적으로 정리합니다.",
    fullDescription: "SWOT 프레임워크를 활용하여 내외부 환경을 체계적으로 분석하고 전략적 통찰을 도출합니다.",
    category: "전략",
    icon: "⚖️",
    compatibleRoles: ["strategist"],
    promptBoost: "SWOT 분석 역량으로 강점(S), 약점(W), 기회(O), 위협(T)을 브리프에 명시하세요.",
    isPremium: false,
  },
  {
    id: "skill-okr",
    name: "OKR 설계",
    description: "목표와 핵심 결과지표를 OKR 구조로 설계합니다.",
    fullDescription: "Objective와 Key Results를 구체적으로 정의하여 실행 계획의 측정 가능성을 높입니다.",
    category: "전략",
    icon: "🏆",
    compatibleRoles: ["strategist", "operator"],
    promptBoost: "OKR 설계 역량으로 명확한 Objective 1개와 측정 가능한 Key Results 3개를 결과물에 포함하세요.",
    isPremium: false,
  },
  {
    id: "skill-brand-positioning",
    name: "브랜드 포지셔닝",
    description: "브랜드의 차별화 포인트와 시장 내 위치를 명확히 정의합니다.",
    fullDescription: "포지셔닝 맵, 브랜드 핵심 가치, 경쟁 대비 차별점을 도출하여 일관된 브랜드 방향을 수립합니다.",
    category: "전략",
    icon: "🏷️",
    compatibleRoles: ["strategist"],
    promptBoost: "브랜드 포지셔닝 역량으로 핵심 차별점, 타겟 포지셔닝 문장, 경쟁 대비 강점을 브리프에 반영하세요.",
    isPremium: false,
  },
  {
    id: "skill-channel-strategy",
    name: "채널 전략 설계",
    description: "목표 고객에게 닿는 최적 채널 조합과 우선순위를 설계합니다.",
    fullDescription: "온·오프라인 채널 특성 분석, 채널별 CAC 추정, 고객 여정별 채널 믹스를 설계하여 효율적인 도달 전략을 수립합니다.",
    category: "전략",
    icon: "📡",
    compatibleRoles: ["strategist", "operator"],
    promptBoost: "채널 전략 설계 역량으로 채널별 우선순위, 예상 도달 비용, 측정 지표를 결과물에 포함하세요.",
    isPremium: false,
  },
  {
    id: "skill-ir-pitch",
    name: "IR 피치 구조화",
    description: "투자자를 설득할 사업 스토리와 핵심 지표를 구조화합니다.",
    fullDescription: "문제-해결-시장-수익모델-팀-요청 구조로 IR 내러티브를 정리하고 투자자가 묻는 핵심 질문에 선제 대응합니다.",
    category: "전략",
    icon: "💡",
    compatibleRoles: ["strategist"],
    promptBoost: "IR 피치 구조화 역량으로 사업 핵심 스토리, 성장 지표, 투자 요청 근거를 브리프에 포함하세요.",
    isPremium: true,
  },
  {
    id: "skill-content-calendar",
    name: "콘텐츠 캘린더",
    description: "채널별 콘텐츠 게시 일정과 주제를 체계적으로 계획합니다.",
    fullDescription: "월간·주간 게시 캘린더, 채널별 콘텐츠 유형, 핵심 메시지 일관성을 계획하여 콘텐츠 실행력을 높입니다.",
    category: "전략",
    icon: "📅",
    compatibleRoles: ["strategist", "operator"],
    promptBoost: "콘텐츠 캘린더 역량으로 주간 게시 계획, 채널별 포맷, 핵심 메시지 키워드를 결과물에 포함하세요.",
    isPremium: false,
  },

  // ────────────────────────────────────────────
  // 성장 스킬
  // ────────────────────────────────────────────
  {
    id: "skill-growth-experiment",
    name: "성장 실험 설계",
    description: "빠른 검증을 위한 A/B 테스트와 성장 실험 계획을 설계합니다.",
    fullDescription: "실험 가설 수립, 성공 지표 정의, 최소 샘플 크기, 측정 기간을 계획하여 데이터 기반 성장을 가속합니다.",
    category: "성장",
    icon: "🧪",
    compatibleRoles: ["operator"],
    promptBoost: "성장 실험 설계 역량으로 실험 가설, 측정 지표, 성공 기준을 실행 계획에 포함하세요.",
    isPremium: false,
  },
  {
    id: "skill-funnel-optimization",
    name: "퍼널 최적화",
    description: "고객 전환 퍼널의 병목을 진단하고 개선 방안을 제시합니다.",
    fullDescription: "인지→관심→고려→전환→재구매 단계별 이탈률과 병목을 분석하고 단계별 전환율 개선 액션을 도출합니다.",
    category: "성장",
    icon: "🚰",
    compatibleRoles: ["operator"],
    promptBoost: "퍼널 최적화 역량으로 주요 이탈 단계, 병목 원인, 단계별 개선 액션을 실행 계획에 포함하세요.",
    isPremium: false,
  },
  {
    id: "skill-product-roadmap",
    name: "제품 로드맵 설계",
    description: "기능 우선순위와 출시 계획을 체계적으로 로드맵으로 만듭니다.",
    fullDescription: "RICE 프레임워크로 기능 우선순위를 점수화하고 분기별 출시 계획, 디펜던시, 리소스 요구사항을 정리합니다.",
    category: "성장",
    icon: "🛤️",
    compatibleRoles: ["operator"],
    promptBoost: "제품 로드맵 설계 역량으로 RICE 우선순위 점수, 분기별 출시 계획, 핵심 디펜던시를 실행 계획에 포함하세요.",
    isPremium: false,
  },
  {
    id: "skill-campaign-brief",
    name: "캠페인 브리프",
    description: "광고·마케팅 캠페인의 목표, 타겟, 메시지, 예산을 구조화합니다.",
    fullDescription: "캠페인 목표, 타겟 오디언스 정의, 핵심 메시지, 채널 믹스, 예산 배분, KPI를 한 페이지 브리프로 정리합니다.",
    category: "성장",
    icon: "📢",
    compatibleRoles: ["operator"],
    promptBoost: "캠페인 브리프 역량으로 캠페인 목표, 타겟 정의, 핵심 메시지, 채널별 예산 배분을 실행 계획에 포함하세요.",
    isPremium: false,
  },
  {
    id: "skill-sales-sequence",
    name: "영업 시퀀스 설계",
    description: "리드 발굴부터 클로징까지 영업 단계별 액션 시퀀스를 설계합니다.",
    fullDescription: "콜드 아웃리치, 후속 연락, 미팅 준비, 제안서 구조, 클로징 전술을 단계별로 정리하여 영업 효율을 높입니다.",
    category: "성장",
    icon: "📞",
    compatibleRoles: ["operator"],
    promptBoost: "영업 시퀀스 설계 역량으로 단계별 영업 액션, 각 단계의 목표 메시지, 후속 타이밍을 실행 계획에 포함하세요.",
    isPremium: false,
  },
  {
    id: "skill-onboarding-playbook",
    name: "온보딩 플레이북",
    description: "신규 고객의 첫 경험을 설계하는 온보딩 단계별 플레이북입니다.",
    fullDescription: "Day0~Day30 온보딩 여정, 단계별 메시지, 활성화 체크포인트, 이탈 감지 신호를 정의하여 초기 리텐션을 높입니다.",
    category: "성장",
    icon: "🎁",
    compatibleRoles: ["operator"],
    promptBoost: "온보딩 플레이북 역량으로 초기 7일 핵심 액션, 활성화 체크포인트, 이탈 감지 트리거를 실행 계획에 포함하세요.",
    isPremium: false,
  },
  {
    id: "skill-partnership-proposal",
    name: "파트너십 제안서",
    description: "파트너사와의 협력 구조와 가치 제안을 문서화합니다.",
    fullDescription: "파트너 발굴 기준, 상호 가치 제안, 협력 범위 정의, 수익 분배 모델을 정리하여 파트너십 제안의 완성도를 높입니다.",
    category: "성장",
    icon: "🤝",
    compatibleRoles: ["operator"],
    promptBoost: "파트너십 제안서 역량으로 파트너 선정 기준, 상호 가치 제안, 협력 범위를 실행 계획에 포함하세요.",
    isPremium: false,
  },

  // ────────────────────────────────────────────
  // 운영 스킬
  // ────────────────────────────────────────────
  {
    id: "skill-quality-check",
    name: "품질 심화 검토",
    description: "결과물의 논리적 완결성과 실행 가능성을 더 엄격하게 검토합니다.",
    fullDescription: "품질 기준 체크리스트, 논리적 일관성, 실행 가능성 점검을 통해 결과물 완성도를 높입니다.",
    category: "운영",
    icon: "✅",
    compatibleRoles: ["reviewer"],
    promptBoost: "품질 심화 검토 역량으로 논리적 갭, 실행 불가능한 가정, 누락 항목을 반드시 명시하세요.",
    isPremium: false,
  },
  {
    id: "skill-sprint-planning",
    name: "스프린트 계획",
    description: "실행 계획을 2주 단위 스프린트로 분해하고 우선순위를 배분합니다.",
    fullDescription: "백로그 정리, 스프린트 목표 설정, 태스크 포인트 배분, 데일리 체크포인트를 설계하여 애자일 실행을 지원합니다.",
    category: "운영",
    icon: "🏃",
    compatibleRoles: ["operator"],
    promptBoost: "스프린트 계획 역량으로 2주 단위 목표, 핵심 태스크 목록, 완료 기준을 실행 계획에 포함하세요.",
    isPremium: false,
  },

  // ────────────────────────────────────────────
  // 검토 스킬
  // ────────────────────────────────────────────
  {
    id: "skill-legal-risk-check",
    name: "법무 리스크 체크",
    description: "실행 계획 내 잠재적 법적 리스크 항목을 검토합니다.",
    fullDescription: "계약 조건, 규제 준수 여부, 지식재산권, 개인정보 보호 이슈를 체크리스트로 점검하여 법적 리스크를 사전에 관리합니다.",
    category: "검토",
    icon: "⚖️",
    compatibleRoles: ["reviewer"],
    promptBoost: "법무 리스크 체크 역량으로 주요 법적 리스크 항목, 규제 준수 여부, 추가 확인이 필요한 사항을 검토 결과에 명시하세요.",
    isPremium: true,
  },
  {
    id: "skill-compliance-audit",
    name: "컴플라이언스 감사",
    description: "내부 정책과 산업 규정 준수 여부를 체계적으로 감사합니다.",
    fullDescription: "내부 승인 프로세스, 산업별 규정(금융·의료·개인정보 등), 윤리 가이드라인 준수 여부를 항목별로 점검합니다.",
    category: "검토",
    icon: "🔒",
    compatibleRoles: ["reviewer"],
    promptBoost: "컴플라이언스 감사 역량으로 규정 준수 항목 체크리스트, 미준수 위험 항목, 내부 승인 필요 사항을 검토 결과에 포함하세요.",
    isPremium: true,
  },
  {
    id: "skill-feasibility-review",
    name: "실현 가능성 검토",
    description: "실행 계획의 기술·자원·시간 측면에서 현실적 타당성을 검토합니다.",
    fullDescription: "필요 자원 대비 가용 자원, 타임라인 현실성, 기술 구현 난이도를 평가하여 실행 전 조정이 필요한 부분을 명확히 합니다.",
    category: "검토",
    icon: "🔬",
    compatibleRoles: ["reviewer"],
    promptBoost: "실현 가능성 검토 역량으로 자원·시간·기술 측면의 실현 가능성 평가와 조정이 필요한 항목을 검토 결과에 명시하세요.",
    isPremium: false,
  },
  {
    id: "skill-finance-review",
    name: "재무 타당성 검토",
    description: "예산 계획과 수익성 가설의 현실성을 수치로 검토합니다.",
    fullDescription: "예산 초과 위험, 수익 모델의 현실성, 현금 흐름 타이밍을 점검하여 재무적 리스크를 사전에 관리합니다.",
    category: "검토",
    icon: "💰",
    compatibleRoles: ["reviewer"],
    promptBoost: "재무 타당성 검토 역량으로 예산 적정성, 수익 모델 현실성, 현금 흐름 위험을 검토 결과에 포함하세요.",
    isPremium: false,
  },

  // ────────────────────────────────────────────
  // 출력 스킬 (파일 생성)
  // ────────────────────────────────────────────
  {
    id: "skill-pptx",
    name: "프레젠테이션 생성",
    description: "워크플로 결과물을 PowerPoint 슬라이드 덱으로 자동 생성합니다.",
    fullDescription: "실행 결과를 구조화된 PPT로 변환하여 보고나 공유에 바로 사용할 수 있는 덱을 만듭니다.",
    category: "출력",
    icon: "📑",
    compatibleRoles: ["operator"],
    outputFormat: "pptx",
    promptBoost: "프레젠테이션 생성 스킬로 결과물이 슬라이드 구조(제목, 핵심 메시지, 상세 내용)로 명확히 구분되게 작성하세요.",
    isPremium: true,
  },
  {
    id: "skill-excel",
    name: "Excel 리포트",
    description: "워크플로 결과물을 Excel 스프레드시트로 자동 생성합니다.",
    fullDescription: "체크리스트와 실행 계획을 Excel 표 형식으로 정리하여 팀 협업과 진행 관리를 쉽게 합니다.",
    category: "출력",
    icon: "📋",
    compatibleRoles: ["operator"],
    outputFormat: "xlsx",
    promptBoost: "Excel 리포트 스킬로 실행 계획과 체크리스트를 표 형식으로 정리(항목, 담당자, 기한, 상태)하세요.",
    isPremium: true,
  },
  {
    id: "skill-pdf",
    name: "PDF 리포트",
    description: "워크플로 전체 결과물을 PDF 문서로 자동 생성합니다.",
    fullDescription: "브리프부터 리뷰까지 전체 실행 결과를 인쇄 가능한 PDF 리포트로 패키징합니다.",
    category: "출력",
    icon: "📄",
    compatibleRoles: ["operator", "reviewer"],
    outputFormat: "pdf",
    promptBoost: "PDF 리포트 스킬로 결과물을 섹션별로 명확히 구분하고 요약-본문-결론 구조로 작성하세요.",
    isPremium: true,
  },
];

export function getSkillById(skillId: string): SkillCatalogItem | undefined {
  return skillCatalog.find((s) => s.id === skillId);
}

export function getSkillsByRole(role: AgentRoleType): SkillCatalogItem[] {
  return skillCatalog.filter((s) => s.compatibleRoles.includes(role));
}

export function getOutputSkills(): SkillCatalogItem[] {
  return skillCatalog.filter((s) => s.outputFormat !== undefined);
}

export function getSkillsByCategory(category: SkillCategory): SkillCatalogItem[] {
  return skillCatalog.filter((s) => s.category === category);
}
