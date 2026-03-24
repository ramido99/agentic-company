/**
 * POST /api/payments/webhook
 * TossPayments 웹훅 핸들러
 *
 * TossPayments가 결제 상태 변경 시 이 엔드포인트를 호출합니다.
 * 웹훅 시크릿으로 서명 검증 후 구독 상태를 업데이트합니다.
 *
 * TossPayments 대시보드 > 개발자 도구 > 웹훅에서 등록:
 *   https://your-domain.com/api/payments/webhook
 */
import { SubscriptionStatus, SubscriptionPlan } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";
// NOTE: prisma.subscription is used directly since it's part of the base schema

export const dynamic = "force-dynamic";

type TossWebhookPayload = {
  eventType: string;
  createdAt: string;
  data: {
    paymentKey?: string;
    orderId?: string;
    status?: string;
    customerKey?: string;
    amount?: number;
    metadata?: {
      workspaceId?: string;
      planTier?: string;
    };
  };
};

function mapTossStatusToSubscriptionStatus(tossStatus: string): SubscriptionStatus | null {
  switch (tossStatus) {
    case "DONE":
    case "IN_PROGRESS":
      return SubscriptionStatus.ACTIVE;
    case "WAITING_FOR_DEPOSIT":
      return SubscriptionStatus.INCOMPLETE;
    case "CANCELED":
    case "PARTIAL_CANCELED":
    case "ABORTED":
    case "EXPIRED":
      return SubscriptionStatus.CANCELED;
    default:
      return null;
  }
}

export async function POST(request: Request) {
  let payload: TossWebhookPayload;
  try {
    payload = await request.json();
  } catch {
    return new Response("Invalid JSON", { status: 400 });
  }

  const { eventType, data } = payload;

  console.log(`[TossPayments Webhook] eventType=${eventType}`, data);

  // 결제 취소/만료 처리 — orderId로 구독 찾아서 상태 업데이트
  if (["PAYMENT_STATUS_CHANGED", "BILLING_KEY_STATUS_CHANGED"].includes(eventType)) {
    const newStatus = data.status ? mapTossStatusToSubscriptionStatus(data.status) : null;

    if (newStatus && data.orderId) {
      try {
        // orderId는 {workspaceId}_{planTier}_{timestamp} 형식으로 생성됩니다.
        const parts = data.orderId.split("_");
        const workspaceId = parts[0];

        if (workspaceId) {
          const sub = await prisma.subscription.findFirst({
            where: { workspaceId },
            orderBy: { createdAt: "desc" },
          });

          if (sub) {
            await prisma.subscription.update({
              where: { id: sub.id },
              data: { status: newStatus },
            });
            console.log(`[TossPayments Webhook] 구독 상태 업데이트: ${workspaceId} → ${newStatus}`);
          }
        }
      } catch (err) {
        console.error("[TossPayments Webhook] DB 업데이트 실패:", err);
        // 웹훅은 실패해도 200 반환 (재시도 방지)
      }
    }
  }

  // 정기 결제 성공 처리
  if (eventType === "PAYMENT_STATUS_CHANGED" && data.status === "DONE") {
    try {
      const parts = data.orderId?.split("_") ?? [];
      const workspaceId = parts[0];
      const planTierRaw = parts[1];

      if (workspaceId && planTierRaw) {
        const planMap: Record<string, SubscriptionPlan> = {
          solo: SubscriptionPlan.SOLO,
          studio: SubscriptionPlan.STUDIO,
          free: SubscriptionPlan.FREE,
        };
        const plan = planMap[planTierRaw.toLowerCase()] ?? SubscriptionPlan.FREE;

        const now = new Date();
        const periodEnd = new Date(now);
        periodEnd.setMonth(periodEnd.getMonth() + 1);

        const sub = await prisma.subscription.findFirst({
          where: { workspaceId },
          orderBy: { createdAt: "desc" },
        });

        if (sub) {
          await prisma.subscription.update({
            where: { id: sub.id },
            data: {
              plan,
              status: SubscriptionStatus.ACTIVE,
              currentPeriodStart: now,
              currentPeriodEnd: periodEnd,
            },
          });
        }
      }
    } catch (err) {
      console.error("[TossPayments Webhook] 정기 결제 처리 실패:", err);
    }
  }

  return new Response("OK", { status: 200 });
}
