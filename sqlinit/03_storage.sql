-- =============================================================================
-- 03_storage.sql — Supabase Storage 버킷 생성 및 접근 정책 설정
--
-- ※ Supabase 대시보드 UI로 버킷을 만든 경우 이 파일은 건너뛰어도 됩니다.
--    SQL Editor → Extensions에서 storage 확장이 활성화된 경우만 실행 가능.
-- =============================================================================

-- ─── 버킷 생성 ────────────────────────────────────────────────────────────────

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'workflow-artifacts',
  'workflow-artifacts',
  false,          -- 비공개 버킷 (서비스 롤 키로만 접근)
  52428800,       -- 최대 파일 크기: 50MB
  ARRAY[
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',  -- .pptx
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',           -- .xlsx
    'text/markdown',
    'text/plain',
    'application/json'
  ]
)
ON CONFLICT (id) DO NOTHING;

-- =============================================================================
-- ─── Storage RLS 정책 ─────────────────────────────────────────────────────────
-- 서비스 롤(service_role)은 RLS를 우회하므로 아래 정책은
-- 클라이언트(anon/authenticated) 직접 접근을 막기 위한 추가 보호입니다.
-- =============================================================================

-- 인증된 사용자는 자신의 워크스페이스 파일만 읽기 가능
CREATE POLICY "Authenticated users can read own workspace files"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'workflow-artifacts'
    -- 경로 형식: {workspaceId}/{runId}/{filename}
    -- 워크스페이스 소유권 검증은 API 레이어(supabase-storage.ts)에서 처리
  );

-- 업로드/삭제는 서비스 롤만 허용 (클라이언트 직접 접근 차단)
-- → API Route에서 SUPABASE_SERVICE_ROLE_KEY 사용 필수
