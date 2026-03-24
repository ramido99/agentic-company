# Agentic Company — Design System

> 이 문서는 Agentic Company의 단일 진실 소스(single source of truth)입니다.
> 컴포넌트 스타일링은 **반드시 이 문서의 규칙을 따라야 합니다.**

---

## 원칙

1. **Tailwind 유틸리티 클래스 금지** — Turbopack 워크스페이스 루트 감지 버그로 인해 JIT가 올바르게 스캔하지 않습니다. 레이아웃·스타일은 모두 `style={{}}` 인라인 또는 `globals.css` CSS 클래스를 사용합니다.
2. **CSS 변수 우선** — 색상은 반드시 `var(--token)` 형태로 참조합니다. 하드코딩된 hex/rgb 값은 디자인 토큰에 없는 경우에만 사용합니다.
3. **globals.css CSS 클래스** — 반복적인 UI 패턴(card, badge, btn, form-input 등)은 `globals.css`에 정의된 클래스를 사용합니다.
4. **인라인 style** — 레이아웃(display, grid, flex, gap, padding, margin)은 인라인 스타일로 작성합니다.

---

## 디자인 토큰 (`app/globals.css` `:root`)

### 색상

| 토큰 | 값 | 용도 |
|------|-----|------|
| `--bg` | `#08080c` | 전체 페이지 배경 |
| `--surface` | `#111118` | 카드, 패널 배경 |
| `--surface-subtle` | `#18181f` | 서브 레이어, 테이블 헤더 |
| `--text` | `#ededf5` | 본문 텍스트 |
| `--text-muted` | `#8080a0` | 보조 텍스트 |
| `--text-faint` | `#444460` | 비활성, 힌트 |
| `--border` | `rgba(255,255,255,0.07)` | 기본 테두리 |
| `--border-strong` | `rgba(255,255,255,0.14)` | 강조 테두리 |
| `--brand` | `#7c3aed` | 메인 브랜드 (보라) |
| `--brand-hover` | `#6d28d9` | 브랜드 호버 |
| `--brand-soft` | `rgba(167,139,250,0.12)` | 브랜드 소프트 배경 |
| `--brand-muted` | `#a78bfa` | 브랜드 텍스트용 |
| `--success` | `#4ade80` | 성공 |
| `--warning` | `#fb923c` | 경고 |
| `--danger` | `#f87171` | 오류/위험 |
| `--sidebar-bg` | `#050507` | 사이드바 배경 |

### 반경 (Radius)

| 토큰 | 값 |
|------|----|
| `--radius-sm` | `4px` |
| `--radius-md` | `6px` |
| `--radius-lg` | `12px` |
| `--radius-xl` | `16px` |

### 전환 (Transition)

| 토큰 | 값 |
|------|----|
| `--transition` | `150ms cubic-bezier(0.4,0,0.2,1)` |

---

## 타이포그래피

### CSS 클래스 사용

```tsx
// 페이지 제목 영역
<span className="page-eyebrow">카테고리명</span>
<h1 className="page-title">페이지 제목</h1>
<p className="page-description">설명</p>

// 섹션 제목
<div className="section-title">섹션명</div>
<div className="section-description">설명</div>
```

### 인라인 타이포그래피 규칙

| 용도 | 크기 | 굵기 | 색상 |
|------|------|------|------|
| 페이지 제목 | `24px` | `700` | `var(--text)` |
| 섹션 제목 | `15px` | `700` | `var(--text)` |
| 카드 제목 | `14–15px` | `600` | `var(--text)` |
| 본문 | `14px` | `400` | `var(--text-muted)` |
| 캡션/레이블 | `11–12px` | `600` | `var(--text-faint)` |
| Eyebrow | `11px` | `600` | `var(--brand)`, uppercase |

---

## 컴포넌트 CSS 클래스 (globals.css)

### 카드
```tsx
<div className="card">...</div>               // 기본 카드
<div className="card card-hover">...</div>    // 호버 효과 포함
<div className="focus-card">...</div>         // 강조 카드 (보라 그라디언트)
```
- `padding`은 인라인 스타일로: `style={{ padding: "24px" }}`

### 뱃지
```tsx
<span className="badge badge-brand">텍스트</span>
<span className="badge badge-success">완료</span>
<span className="badge badge-warning">진행중</span>
<span className="badge badge-danger">실패</span>
<span className="badge badge-neutral">기본</span>
```
또는 `<Badge>` 컴포넌트 사용 (variant 프롭 동일)

### 버튼 (`Button.tsx`)
```tsx
<Button variant="primary">주요 액션</Button>
<Button variant="secondary">보조 액션</Button>
<Button variant="ghost">텍스트 버튼</Button>
<Button variant="danger">삭제/위험</Button>
<Button variant="brand-ghost">브랜드 유령</Button>
```
- 내부는 **인라인 스타일** (`cva` + Tailwind 클래스 사용 금지)

### 폼
```tsx
<div className="form-group">
  <label className="form-label">레이블</label>
  <input className="form-input" />
  <textarea className="form-textarea" />
  <select className="form-select" />
  <p className="form-error">오류 메시지</p>
</div>
```

### 메트릭 카드
```tsx
<MetricCard value="42" label="총 실행" />
<MetricCard value="8" label="완료" strong />
```

---

## 레이아웃 규칙

### 그리드 (항상 인라인 스타일)
```tsx
// 2열
<div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "16px" }}>

// 3열
<div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px" }}>

// 4열
<div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "12px" }}>

// 비대칭 (메인 + 사이드바)
<div style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: "24px" }}>
```

### 플렉스 (항상 인라인 스타일)
```tsx
// 수평 정렬
<div style={{ display: "flex", alignItems: "center", gap: "12px" }}>

// 수직 스택
<div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>

// 양끝 정렬
<div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
```

### 공통 간격
| 용도 | 값 |
|------|----|
| 섹션 간 간격 | `gap: "32px"` |
| 카드 내부 간격 | `gap: "16–20px"` |
| 아이템 간 간격 | `gap: "8–12px"` |
| 카드 padding | `padding: "24px"` |
| 소형 카드 padding | `padding: "16px"` |

---

## 페이지 구조 패턴

```tsx
// 모든 콘솔 페이지 기본 구조
export default function SomePage() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "32px" }}>
      {/* 1. 페이지 헤더 */}
      <PageHeader
        eyebrow="카테고리"
        title="페이지 제목"
        description="설명"
        actions={<Button variant="primary">액션</Button>}
      />

      {/* 2. 지표 행 (선택) */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px" }}>
        <MetricCard value="10" label="레이블" />
      </div>

      {/* 3. 메인 콘텐츠 */}
      <div className="card" style={{ padding: "24px" }}>
        ...
      </div>
    </div>
  );
}
```

---

## 색상 사용 금지 패턴

```tsx
// ❌ 금지 — Tailwind 클래스
className="text-slate-600 bg-indigo-100 grid-cols-3 space-y-4"

// ❌ 금지 — 하드코딩 색상
style={{ color: "#64748b" }}

// ✅ 올바른 — CSS 변수
style={{ color: "var(--text-muted)" }}

// ✅ 올바른 — globals.css 클래스
className="card badge-success form-input"

// ✅ 올바른 — 인라인 레이아웃
style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px" }}
```

---

## 파일 구조

```
app/
  globals.css          ← 유일한 CSS 파일. 모든 CSS 변수·클래스 정의.
  layout.tsx
  page.tsx             ← 랜딩 (use client, framer-motion, 인라인 스타일)
  dashboard/page.tsx
  ...

src/
  components/
    AppShell.tsx       ← 레이아웃 쉘 (use client)
    AppNavigation.tsx  ← 사이드바 네비 (use client)
    RunWorkflowButton.tsx
    ui/
      Button.tsx       ← 인라인 스타일 variant 맵
      Badge.tsx        ← CSS 클래스 방식
      Card.tsx
      PageHeader.tsx
      MetricCard.tsx
      EmptyState.tsx
      StageRail.tsx
      sign-in-1.tsx    ← 인라인 스타일
      nested-dialog.tsx
      data-table.tsx
      selector-chips.tsx
```
