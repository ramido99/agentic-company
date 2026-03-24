<div align="center">

# 🤖 Agentic Company

### AI 에이전트가 당신의 회사를 대신 일합니다

**비즈니스 목표를 입력하면, AI 에이전트 팀이 전략 수립부터 실행·검토까지 자동으로 처리합니다.**

<br/>

[![Next.js](https://img.shields.io/badge/Next.js_15-black?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Prisma](https://img.shields.io/badge/Prisma-2D3748?style=for-the-badge&logo=prisma&logoColor=white)](https://prisma.io)
[![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)](https://supabase.com)
[![Vercel](https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://vercel.com)

</div>

---

## 📌 서비스 소개

Agentic Company는 **AI 에이전트를 직원처럼 채용하고, 비즈니스 목표를 자동으로 실행**하는 플랫폼입니다.

기존 AI 도구들이 단순 질의응답에 머무는 것과 달리, Agentic Company는 **전략 → 실행 → 검토** 3단계 역할 분리 구조로 실제 업무 워크플로우를 자동화합니다.

```
회사 등록 → 에이전트 채용 → 목표 입력 → AI 자동 실행 → 산출물 생성
```

---

## ✨ 주요 기능

| 기능 | 설명 |
|------|------|
| 🏢 **회사 관리** | 회사를 등록하고 AI 에이전트 팀을 구성 |
| 🤖 **에이전트 채용** | 24종 전문 에이전트를 역할별로 채용 (전략·실행·검토) |
| 🎯 **목표 설정** | 비즈니스 목표를 등록하면 AI가 실행 계획 수립 |
| ⚡ **워크플로우 자동 실행** | 에이전트가 31개 스킬로 업무를 자동 처리 |
| 📄 **산출물 자동 생성** | PPTX·Markdown·XLSX·PDF 형식으로 결과물 저장 |
| 📊 **대시보드** | KPI 메트릭, 실행 이력, 에이전트 성과 한눈에 확인 |
| 💳 **구독 과금** | Starter · Growth · Enterprise 플랜 (TossPayments 연동) |

---

## 🤖 에이전트 구조

3가지 역할의 **24종 AI 에이전트**와 **31개 전문 스킬**로 구성됩니다.

```
┌─────────────────────────────────────────────────────┐
│                   AI 에이전트 팀                       │
├─────────────┬───────────────────┬────────────────────┤
│  🧠 전략가   │    ⚡ 실행가       │    🔍 검토자        │
│  STRATEGIST │    OPERATOR       │    REVIEWER        │
├─────────────┼───────────────────┼────────────────────┤
│ 시장 분석    │ 캠페인 브리프 작성  │ 법무 리스크 체크     │
│ 브랜드 전략  │ 콘텐츠 캘린더 관리  │ 컴플라이언스 감사    │
│ 고객 리서치  │ 성장 실험 설계     │ 재무 타당성 검토     │
│ IR 피치 설계 │ 영업 시퀀스 자동화  │ KPI 대시보드 분석   │
│ ...8종       │ ...8종             │ ...8종             │
└─────────────┴───────────────────┴────────────────────┘
```

---

## 🛠 기술 스택

| 레이어 | 기술 |
|--------|------|
| **Framework** | Next.js 15 (App Router, Server Components) |
| **Language** | TypeScript 5 (strict mode) |
| **Styling** | Tailwind CSS v4 + shadcn/ui |
| **Database** | PostgreSQL (Supabase 호스팅) |
| **ORM** | Prisma 6 |
| **Auth** | NextAuth.js v4 (Google OAuth) |
| **Storage** | Supabase Storage (산출물 파일 저장) |
| **AI** | Azure OpenAI GPT-4o / Claude API |
| **Search** | Tavily API / Serper.dev |
| **Payment** | TossPayments |
| **Deploy** | Vercel |

---

## 📂 프로젝트 구조

```
agentic-company/
├── app/                        # Next.js App Router 페이지
│   ├── api/                    # API Routes (백엔드 엔드포인트)
│   │   ├── companies/          # 회사 CRUD
│   │   ├── agents/             # 에이전트 채용/해고
│   │   ├── goals/              # 목표 관리
│   │   ├── workflows/          # 워크플로우 실행
│   │   └── payments/           # 결제 처리
│   ├── companies/              # 회사 목록·상세 페이지
│   ├── agents/                 # 에이전트 카탈로그
│   ├── goals/                  # 목표 관리 페이지
│   ├── workflows/              # 워크플로우 실행 이력
│   └── dashboard/              # 메인 대시보드
│
├── src/
│   ├── components/             # 재사용 UI 컴포넌트
│   │   └── ui/                 # shadcn/ui 기반 기본 컴포넌트
│   └── lib/
│       ├── agents/             # 에이전트 로직 (전략/실행/검토)
│       ├── mock/               # 에이전트·스킬 카탈로그 (24종 / 31개)
│       ├── repositories/       # DB 접근 레이어 (Prisma)
│       ├── workflows/          # 워크플로우 실행 엔진
│       ├── storage/            # Supabase Storage 연동
│       └── auth/               # NextAuth 설정
│
├── prisma/
│   └── schema.prisma           # DB 스키마 (11개 모델)
│
└── CONTRIBUTING.md             # 개발 작업 지침 (필독)
```

---

## 🚀 로컬 실행 가이드

### 사전 준비

- **Node.js** 18.17 이상
- **PostgreSQL** DB (Supabase 프로젝트 권장)
- **Google OAuth** 앱 (Google Cloud Console)

---

### 1. 레포지토리 클론

```bash
git clone https://github.com/ramido99/agentic-company.git
cd agentic-company
```

### 2. 의존성 설치

```bash
npm install
```

### 3. 환경변수 설정

```bash
cp .env.example .env
```

`.env` 파일을 열고 아래 항목을 채워주세요:

```env
# 필수
DATABASE_URL="postgresql://..."        # Supabase DB 연결 문자열
NEXTAUTH_SECRET="..."                  # openssl rand -base64 32 으로 생성
AUTH_GOOGLE_ID="..."                   # Google OAuth 클라이언트 ID
AUTH_GOOGLE_SECRET="..."               # Google OAuth 클라이언트 시크릿
SUPABASE_URL="https://..."            # Supabase 프로젝트 URL
SUPABASE_SERVICE_ROLE_KEY="..."       # Supabase Service Role 키

# AI (하나 이상 필요)
AZURE_OPENAI_API_KEY="..."
AZURE_OPENAI_ENDPOINT="..."
AZURE_OPENAI_DEPLOYMENT="..."
```

> 각 항목 발급 방법은 `.env.example` 주석을 참고하세요.

### 4. 데이터베이스 마이그레이션

```bash
# Prisma 클라이언트 생성
npx prisma generate

# DB 스키마 적용
npx prisma db push
```

### 5. 개발 서버 실행

```bash
npm run dev
```

브라우저에서 **http://localhost:3000** 접속

---

### Supabase Storage 버킷 설정 (산출물 파일 저장용)

Supabase 대시보드 → Storage → **New Bucket** 생성:

| 항목 | 값 |
|------|----|
| Bucket name | `workflow-artifacts` |
| Public bucket | `OFF` (비공개) |

---

## 📋 주요 명령어

```bash
npm run dev              # 개발 서버 실행 (Turbopack)
npm run build            # 프로덕션 빌드
npm run lint             # ESLint 검사
npx tsc --noEmit         # TypeScript 타입 체크
npx prisma studio        # DB GUI 브라우저 열기
npx prisma db push       # 스키마 변경사항 DB 반영
```

---

## 🗄 데이터베이스 구조

```
User ──── Membership ──── Workspace
                              │
                         ┌────┴──────────┐
                         │               │
                      Company          Goal
                         │               │
                         └──── WorkflowRun ────── Artifact
                                    │
                               UsageRecord
```

주요 모델: `User` · `Workspace` · `Company` · `Goal` · `WorkflowRun` · `Artifact`

---

## 🌐 배포 (Vercel)

1. [Vercel](https://vercel.com) → **Add New Project** → GitHub `agentic-company` import
2. **Environment Variables** 탭에서 `.env` 값 전체 등록
3. **Deploy** 클릭 → `main` 브랜치 push 시 자동 배포

> Google OAuth 콘솔에서 승인된 리디렉션 URI에 배포 URL 추가 필요:
> `https://your-domain.vercel.app/api/auth/callback/google`

---

## 📖 개발 참여

코드 기여 전 **[CONTRIBUTING.md](./CONTRIBUTING.md)** 를 먼저 읽어주세요.

모든 작업은 `GitHub Issue → Branch → Commit → PR` 순서로 진행합니다.

---

<div align="center">

**Built with ❤️ using Next.js 15 + AI**

</div>
