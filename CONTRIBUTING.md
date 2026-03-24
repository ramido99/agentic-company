# Contributing Guide — AI 에이전트 자동화 플랫폼

> 이 문서는 코드 변경 시 반드시 따라야 할 작업 지침입니다.
> **모든 코드 수정은 GitHub Issue → Branch → Commit → PR 순서로 진행합니다.**

---

## 목차

1. [작업 흐름 (Workflow)](#1-작업-흐름-workflow)
2. [GitHub Issue 규칙](#2-github-issue-규칙)
3. [브랜치 네이밍 규칙](#3-브랜치-네이밍-규칙)
4. [커밋 메시지 규칙](#4-커밋-메시지-규칙)
5. [Pull Request 규칙](#5-pull-request-규칙)
6. [Vercel 배포 흐름](#6-vercel-배포-흐름)

---

## 1. 작업 흐름 (Workflow)

```
GitHub Issue 등록
      ↓
feature/fix 브랜치 생성
      ↓
코드 수정 & 로컬 테스트
      ↓
git commit (규칙에 맞게)
      ↓
git push → Pull Request 생성
      ↓
코드 리뷰 (셀프 리뷰 포함)
      ↓
main 브랜치 merge
      ↓
Vercel 자동 배포
      ↓
GitHub Issue Close
```

> **원칙:** 이슈 없이 main 브랜치에 직접 push 하지 않는다.

---

## 2. GitHub Issue 규칙

### Issue 생성 시점
- 버그 발견 시
- 새 기능 추가 시
- 리팩터링 / 성능 개선 시
- 문서 업데이트 시

### Issue 라벨 종류

| 라벨 | 의미 |
|------|------|
| `bug` | 버그, 에러 수정 |
| `feature` | 신규 기능 개발 |
| `enhancement` | 기존 기능 개선 |
| `refactor` | 코드 구조 개선 (기능 변화 없음) |
| `docs` | 문서 작성/수정 |
| `chore` | 의존성 업데이트, 설정 변경 |

### Issue 제목 형식
```
[타입] 간단한 설명

예시:
[bug] 회사 삭제 시 Supabase Storage 파일 미삭제
[feature] 에이전트 검색 필터 기능 추가
[enhancement] 회사 목록 페이지 무한 스크롤 적용
```

---

## 3. 브랜치 네이밍 규칙

```
{타입}/{이슈번호}-{간단한-설명-kebab-case}

예시:
feature/12-agent-search-filter
fix/8-company-delete-storage-cleanup
refactor/15-workflow-repository-split
docs/3-update-readme
```

### 브랜치 생성 명령어
```bash
# 이슈 #12번 작업 시작
git checkout -b feature/12-agent-search-filter
```

---

## 4. 커밋 메시지 규칙

### 형식
```
{타입}: {변경 내용 요약} (#{이슈번호})

{본문 — 필요한 경우만, 왜 변경했는지 설명}
```

### 커밋 타입

| 타입 | 의미 |
|------|------|
| `feat` | 새 기능 추가 |
| `fix` | 버그 수정 |
| `refactor` | 리팩터링 |
| `style` | 코드 포맷, 세미콜론 등 (기능 변화 없음) |
| `docs` | 문서 수정 |
| `chore` | 빌드, 패키지, 설정 변경 |
| `test` | 테스트 추가/수정 |

### 커밋 예시
```bash
# 좋은 예
git commit -m "feat: 에이전트 검색 필터 UI 추가 (#12)"
git commit -m "fix: 회사 삭제 시 Storage 파일 미삭제 버그 수정 (#8)"
git commit -m "refactor: company-repository cascade delete 로직 분리 (#15)"

# 나쁜 예 (사용 금지)
git commit -m "수정"
git commit -m "작업중"
git commit -m "fix bug"
```

---

## 5. Pull Request 규칙

### PR 제목
```
{커밋타입}: {변경 내용 요약} (#{이슈번호})

예시:
feat: 에이전트 검색 필터 UI 추가 (#12)
fix: 회사 삭제 시 Storage 파일 미삭제 버그 수정 (#8)
```

### PR 본문 템플릿
```markdown
## 변경 사항
- 변경한 내용을 간단히 설명

## 관련 이슈
Closes #이슈번호

## 테스트 방법
- [ ] 로컬에서 테스트 완료
- [ ] TypeScript 에러 없음 (`npx tsc --noEmit`)
- [ ] ESLint 통과 (`npm run lint`)

## 스크린샷 (UI 변경 시)
```

### merge 전 체크리스트
```bash
# 1. TypeScript 에러 확인
npx tsc --noEmit

# 2. ESLint 확인
npm run lint

# 3. 빌드 확인 (Vercel 배포 전 로컬 검증)
npm run build
```

---

## 6. Vercel 배포 흐름

| 브랜치 | 배포 환경 | URL |
|--------|-----------|-----|
| `main` | Production | `https://agentic-company.vercel.app` |
| `feature/*`, `fix/*` | Preview | `https://agentic-company-{hash}.vercel.app` |

- `main` merge 시 **자동 배포** (수동 조작 불필요)
- 배포 실패 시 Vercel 대시보드 → Deployments → 로그 확인
- 환경변수 변경 시 Vercel 대시보드 → Settings → Environment Variables 에서 수정 후 **Redeploy** 필요

---

## 빠른 참고 — 작업 시작 시 체크리스트

```bash
# 1. main 최신 상태로 동기화
git checkout main
git pull origin main

# 2. 이슈 브랜치 생성
git checkout -b feature/{이슈번호}-{설명}

# 3. 작업 후 커밋
git add {변경파일}
git commit -m "feat: 설명 (#{이슈번호})"

# 4. push & PR 생성
git push origin feature/{이슈번호}-{설명}
# GitHub에서 PR 생성 → Closes #{이슈번호} 명시
```
