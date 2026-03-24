import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/config";
import { aiProviderSettingRepository } from "@/lib/repositories/ai-provider-setting-repository";

export const dynamic = "force-dynamic";

// GET — 현재 저장된 AI 설정 조회 (API 키는 마스킹)
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
  }

  const setting = await aiProviderSettingRepository.findByUserId(session.user.id);
  if (!setting) {
    return NextResponse.json({ setting: null });
  }

  // API 키 복원 후 마스킹 처리
  let maskedKey = "";
  try {
    const decoded = Buffer.from(setting.apiKeyEncrypted, "base64").toString("utf-8");
    maskedKey = decoded.length > 8
      ? decoded.slice(0, 4) + "****" + decoded.slice(-4)
      : "****";
  } catch {
    maskedKey = "****";
  }

  return NextResponse.json({
    setting: {
      id: setting.id,
      provider: setting.provider,
      apiEndpoint: setting.apiEndpoint,
      apiKeyMasked: maskedKey,
      defaultModel: setting.defaultModel,
      isActive: setting.isActive,
      lastValidatedAt: setting.lastValidatedAt,
    },
  });
}

// POST — AI 설정 저장 (upsert)
export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
  }

  let body: {
    provider?: string;
    apiEndpoint?: string;
    apiKey?: string;
    defaultModel?: string;
    isActive?: boolean;
  };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "요청 형식이 올바르지 않습니다." }, { status: 400 });
  }

  const apiKey = typeof body.apiKey === "string" ? body.apiKey.trim() : "";
  const apiEndpoint = typeof body.apiEndpoint === "string" ? body.apiEndpoint.trim() : "https://api.openai.com/v1";
  const defaultModel = typeof body.defaultModel === "string" ? body.defaultModel.trim() : "gpt-4o-mini";
  const provider = typeof body.provider === "string" ? body.provider.trim() : "openai";

  if (!apiKey) {
    return NextResponse.json({ error: "API 키를 입력해 주세요." }, { status: 400 });
  }

  // 간단한 연결 테스트 (openai compatible)
  let validated = false;
  try {
    const testEndpoint = apiEndpoint.replace(/\/$/, "");
    const res = await fetch(`${testEndpoint}/models`, {
      headers: { Authorization: `Bearer ${apiKey}` },
    });
    validated = res.ok || res.status === 403; // 403도 키가 유효하다는 의미일 수 있음
  } catch {
    // 연결 실패해도 저장은 허용
  }

  // API 키를 base64로 인코딩해서 저장 (평문 방지)
  const apiKeyEncrypted = Buffer.from(apiKey).toString("base64");

  const setting = await aiProviderSettingRepository.upsert({
    userId: session.user.id,
    provider,
    apiEndpoint,
    apiKeyEncrypted,
    defaultModel,
    isActive: body.isActive ?? true,
    lastValidatedAt: validated ? new Date() : null,
  });

  return NextResponse.json({
    ok: true,
    validated,
    setting: {
      id: setting.id,
      provider: setting.provider,
      apiEndpoint: setting.apiEndpoint,
      defaultModel: setting.defaultModel,
      isActive: setting.isActive,
      lastValidatedAt: setting.lastValidatedAt,
    },
  });
}

// DELETE — AI 설정 비활성화
export async function DELETE() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
  }

  const existing = await aiProviderSettingRepository.findByUserId(session.user.id);
  if (!existing) {
    return NextResponse.json({ ok: true });
  }

  await aiProviderSettingRepository.upsert({
    userId: session.user.id,
    provider: existing.provider,
    apiEndpoint: existing.apiEndpoint,
    apiKeyEncrypted: existing.apiKeyEncrypted,
    defaultModel: existing.defaultModel,
    isActive: false,
  });

  return NextResponse.json({ ok: true });
}
