"use client";

import { useEffect, useState } from "react";

type Provider = "openai" | "azure" | "custom";

const PROVIDER_DEFAULTS: Record<Provider, { endpoint: string; model: string; label: string }> = {
  openai: {
    endpoint: "https://api.openai.com/v1",
    model: "gpt-4o-mini",
    label: "OpenAI",
  },
  azure: {
    endpoint: "https://<your-resource>.openai.azure.com/",
    model: "gpt-4o",
    label: "Azure OpenAI",
  },
  custom: {
    endpoint: "",
    model: "gpt-4o-mini",
    label: "커스텀 (OpenAI 호환)",
  },
};

type SavedSetting = {
  provider: string;
  apiEndpoint: string;
  apiKeyMasked: string;
  defaultModel: string;
  isActive: boolean;
  lastValidatedAt: string | null;
} | null;

export function SettingsLLMSection() {
  const [saved, setSaved] = useState<SavedSetting>(null);
  const [loading, setLoading] = useState(true);

  const [provider, setProvider] = useState<Provider>("openai");
  const [apiEndpoint, setApiEndpoint] = useState(PROVIDER_DEFAULTS.openai.endpoint);
  const [apiKey, setApiKey] = useState("");
  const [model, setModel] = useState(PROVIDER_DEFAULTS.openai.model);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [showKey, setShowKey] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    fetch("/api/settings/ai-provider")
      .then((r) => r.json())
      .then((data) => {
        if (data.setting) {
          setSaved(data.setting);
          setProvider((data.setting.provider as Provider) || "openai");
          setApiEndpoint(data.setting.apiEndpoint || PROVIDER_DEFAULTS.openai.endpoint);
          setModel(data.setting.defaultModel || "gpt-4o-mini");
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  function handleProviderChange(p: Provider) {
    setProvider(p);
    if (p !== "custom") {
      setApiEndpoint(PROVIDER_DEFAULTS[p].endpoint);
      setModel(PROVIDER_DEFAULTS[p].model);
    }
  }

  async function handleSave() {
    if (!apiKey.trim() && !saved) {
      setMessage({ type: "error", text: "API 키를 입력해 주세요." });
      return;
    }
    // 편집 중인데 키를 바꾸지 않으면 빈 문자열 → 기존 키 유지하지 않음
    // → 저장 취소 처리
    if (isEditing && !apiKey.trim()) {
      setIsEditing(false);
      setMessage(null);
      return;
    }

    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch("/api/settings/ai-provider", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ provider, apiEndpoint, apiKey: apiKey.trim(), defaultModel: model }),
      });
      const data = await res.json();
      if (!res.ok) {
        setMessage({ type: "error", text: data.error ?? "저장에 실패했습니다." });
      } else {
        setMessage({
          type: "success",
          text: data.validated ? "저장 및 연결 확인 완료!" : "저장 완료 (연결 확인 실패 — API 키를 다시 확인해 주세요).",
        });
        setApiKey("");
        setIsEditing(false);
        // 저장된 정보 갱신
        setSaved({
          provider,
          apiEndpoint,
          apiKeyMasked: apiKey.slice(0, 4) + "****" + apiKey.slice(-4),
          defaultModel: model,
          isActive: true,
          lastValidatedAt: data.validated ? new Date().toISOString() : null,
        });
      }
    } catch {
      setMessage({ type: "error", text: "네트워크 오류가 발생했습니다." });
    } finally {
      setSaving(false);
    }
  }

  async function handleDisable() {
    setSaving(true);
    try {
      await fetch("/api/settings/ai-provider", { method: "DELETE" });
      setSaved((prev) => prev ? { ...prev, isActive: false } : null);
      setMessage({ type: "success", text: "사용자 API 키가 비활성화되었습니다. 서버 기본 키로 실행됩니다." });
    } finally {
      setSaving(false);
    }
  }

  const hasSaved = !!saved;
  const isActive = saved?.isActive ?? false;

  return (
    <div>
      <p className="section-title" style={{ marginBottom: "12px" }}>LLM API 연결</p>
      <div className="card" style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "20px" }}>

        {/* 현재 상태 배지 */}
        {!loading && (
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div style={{
              width: "8px", height: "8px", borderRadius: "50%",
              background: isActive && hasSaved ? "var(--success)" : "var(--text-faint)",
              flexShrink: 0,
            }} />
            <span style={{ fontSize: "14px", color: isActive && hasSaved ? "var(--success)" : "var(--text-muted)", fontWeight: 500 }}>
              {isActive && hasSaved
                ? `연결됨 — ${PROVIDER_DEFAULTS[saved!.provider as Provider]?.label ?? saved!.provider} / ${saved!.defaultModel}`
                : hasSaved
                  ? "비활성화 (서버 기본 키 사용 중)"
                  : "서버 기본 키 사용 중"}
            </span>
            {hasSaved && isActive && (
              <span style={{ fontSize: "12px", color: "var(--text-faint)", marginLeft: "4px" }}>
                {saved!.apiKeyMasked}
              </span>
            )}
          </div>
        )}

        {/* 저장된 설정 있고 편집 안 하는 경우 — 간략히 표시 */}
        {hasSaved && !isEditing && (
          <div style={{ display: "flex", gap: "8px" }}>
            <button
              className="btn btn-secondary"
              style={{ fontSize: "13px", padding: "6px 14px" }}
              onClick={() => { setIsEditing(true); setMessage(null); }}
            >
              API 키 변경
            </button>
            {isActive && (
              <button
                className="btn btn-ghost"
                style={{ fontSize: "13px", padding: "6px 14px", color: "var(--text-muted)" }}
                onClick={handleDisable}
                disabled={saving}
              >
                비활성화
              </button>
            )}
          </div>
        )}

        {/* 신규 입력 또는 편집 모드 */}
        {(!hasSaved || isEditing) && (
          <>
            {/* Provider 선택 */}
            <div className="form-group">
              <label className="form-label">LLM 제공자</label>
              <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                {(["openai", "azure", "custom"] as Provider[]).map((p) => (
                  <button
                    key={p}
                    onClick={() => handleProviderChange(p)}
                    style={{
                      padding: "6px 16px",
                      borderRadius: "8px",
                      border: `1.5px solid ${provider === p ? "var(--accent)" : "var(--border)"}`,
                      background: provider === p ? "var(--accent-subtle, rgba(124,58,237,0.08))" : "transparent",
                      color: provider === p ? "var(--accent)" : "var(--text-muted)",
                      fontSize: "13px",
                      fontWeight: provider === p ? 600 : 400,
                      cursor: "pointer",
                    }}
                  >
                    {PROVIDER_DEFAULTS[p].label}
                  </button>
                ))}
              </div>
            </div>

            {/* API 엔드포인트 */}
            <div className="form-group">
              <label className="form-label">API 엔드포인트</label>
              <input
                className="form-input"
                type="text"
                value={apiEndpoint}
                onChange={(e) => setApiEndpoint(e.target.value)}
                placeholder="https://api.openai.com/v1"
              />
              {provider === "azure" && (
                <p style={{ fontSize: "12px", color: "var(--text-faint)", marginTop: "6px" }}>
                  Azure: https://&lt;리소스명&gt;.openai.azure.com/ 형식으로 입력하세요.
                </p>
              )}
            </div>

            {/* API 키 */}
            <div className="form-group">
              <label className="form-label">
                API 키
                {isEditing && (
                  <span style={{ fontSize: "12px", color: "var(--text-faint)", marginLeft: "8px" }}>
                    (새 키를 입력하거나 취소)
                  </span>
                )}
              </label>
              <div style={{ position: "relative" }}>
                <input
                  className="form-input"
                  type={showKey ? "text" : "password"}
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder={provider === "azure" ? "Azure OpenAI API 키" : "sk-..."}
                  style={{ paddingRight: "48px" }}
                />
                <button
                  onClick={() => setShowKey((v) => !v)}
                  style={{
                    position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)",
                    background: "none", border: "none", cursor: "pointer",
                    color: "var(--text-muted)", fontSize: "12px",
                  }}
                >
                  {showKey ? "숨기기" : "보기"}
                </button>
              </div>
            </div>

            {/* 모델 */}
            <div className="form-group">
              <label className="form-label">기본 모델</label>
              <input
                className="form-input"
                type="text"
                value={model}
                onChange={(e) => setModel(e.target.value)}
                placeholder="gpt-4o-mini"
              />
              <p style={{ fontSize: "12px", color: "var(--text-faint)", marginTop: "6px" }}>
                OpenAI: gpt-4o, gpt-4o-mini · Azure: 배포 이름 입력
              </p>
            </div>

            {/* 버튼 */}
            <div style={{ display: "flex", gap: "8px" }}>
              <button
                className="btn btn-primary"
                onClick={handleSave}
                disabled={saving}
                style={{ fontSize: "14px" }}
              >
                {saving ? "저장 중..." : "저장 및 연결 확인"}
              </button>
              {isEditing && (
                <button
                  className="btn btn-ghost"
                  onClick={() => { setIsEditing(false); setApiKey(""); setMessage(null); }}
                  style={{ fontSize: "14px" }}
                >
                  취소
                </button>
              )}
            </div>
          </>
        )}

        {/* 메시지 */}
        {message && (
          <p style={{
            fontSize: "13px",
            color: message.type === "success" ? "var(--success)" : "var(--error, #ef4444)",
            margin: 0,
          }}>
            {message.type === "success" ? "✓ " : "✕ "}{message.text}
          </p>
        )}

        <p style={{ fontSize: "12px", color: "var(--text-faint)", margin: 0 }}>
          여기서 등록한 API 키는 워크플로우 실행 시 서버 환경 변수보다 우선 적용됩니다.
          키는 Base64 인코딩되어 서버에 저장됩니다.
        </p>
      </div>
    </div>
  );
}
