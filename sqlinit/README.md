# sqlinit — 데이터베이스 초기 설정 스크립트

Supabase SQL Editor에서 **순서대로** 실행하세요.

## 실행 순서

| 순서 | 파일 | 설명 |
|------|------|------|
| 1 | `01_schema.sql` | 전체 테이블 스키마 생성 |
| 2 | `02_indexes.sql` | 성능 최적화 인덱스 추가 |
| 3 | `03_storage.sql` | Supabase Storage 버킷 및 정책 설정 |
| 4 | `04_agent_skill_assignment.sql` | AgentSkillAssignment 테이블 (Prisma 외 수동 마이그레이션) |
| 5 | `05_rls_policies.sql` | Row Level Security 정책 설정 |

## 주의사항

- `01_schema.sql`은 `prisma db push` 로 대체 가능합니다.
  Supabase를 직접 쓰거나 Prisma 없이 초기화할 때 사용하세요.
- 이미 테이블이 있는 경우 `CREATE TABLE IF NOT EXISTS` 로 중복 실행해도 안전합니다.
- Storage 버킷은 **Supabase 대시보드 UI** 또는 `03_storage.sql`로 생성합니다.
