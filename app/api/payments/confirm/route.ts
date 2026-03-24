/**
 * POST /api/payments/confirm
 * TossPayments 결제 승인 처리
 *
 * 클라이언트에서 TossPayments SDK 결제 완료 후 paymentKey, orderId, amount를 전달합니다.
 * 서버가 TossPayments 서버에 승인 요청을 보내고 DB 구독 정보를 업데이트합니다.
 */
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/config";
import { getCurrentWorkspace } from "@/lib/auth/workspace";
import { subscriptionRepository } from "@/lib/repositories/subscription-repository";
import { tierToPrismaPlan, type PlanTier } from "@/lib/billing/plans";
import { SubscriptionStatus } from "@prisma/client";

export const dynamic = "force-dynamic";

interface ConfirmPaymentBody {
  paymentKey: string;
  orderId: string;
  amount: number;
  planTier: PlanTier;
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: ConfirmPaymentBody;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { paymentKey, orderId, amount, planTier } = body;

  if (!paymentKey || !orderId || !amount || !planTier) {
    return Response.json({ error: "필수 파라미터가 누락되었습니다." }, { status: 400 });
  }

  const workspace = await getCurrentWorkspace();
  if (!workspace) {
    return Response.json({ error: "워크스페이스를 찾을 수 없습니다." }, { status: 404 });
  }

  // TossPayments 결제 승인 API 호출
  const secretKey = process.env.TOSSPAYMENTS_SECRET_KEY;
  if (!secretKey) {
    return Response.json({ error: "결제 설정이 올바르지 않습니다." }, { status: 500 });
  }

  try {
    const authHeader = "Basic " + Buffer.from(`${secretKey}:`).toString("base64");

    const tossRes = await fetch("https://api.tosspayments.com/v1/payments/confirm", {
      method: "POST",
      headers: {
        Authorization: authHeader,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ paymentKey, orderId, amount }),
    });

    const tossData = await tossRes.json();

    if (!tossRes.ok) {
      console.error("[TossPayments confirm] 실패:", tossData);
      return Response.json(
        { error: tossData.message ?? "결제 승인에 실패했습니다." },
        { status: tossRes.status },
      );
    }

    // 결제 성공 — 구독 정보 업데이트
    const now = new Date();
    const periodEnd = new Date(now);
    periodEnd.setMonth(periodEnd.getMonth() + 1);

    const prismaPlan = tierToPrismaPlan(planTier);

    await subscriptionRepository.upsertCurrent({
      workspaceId: workspace.id,
      plan: prismaPlan,
      status: SubscriptionStatus.ACTIVE,
      provider: "tosspayments",
      providerCustomerId: tossData.customerKey ?? null,
      currentPeriodStart: now,
      currentPeriodEnd: periodEnd,
    });

    return Response.json({
      success: true,
      plan: planTier,
      periodEnd: periodEnd.toISOString(),
      payment: {
        orderId: tossData.orderId,
        amount: tossData.totalAmount,
        method: tossData.method,
        approvedAt: tossData.approvedAt,
      },
    });
  } catch (error) {
    console.error("[POST /api/payments/confirm]", error);
    return Response.json({ error: "결제 처리 중 오류가 발생했습니다." }, { status: 500 });
  }
}
