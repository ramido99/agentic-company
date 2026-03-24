import { MembershipRole, SubscriptionPlan, SubscriptionStatus } from "@prisma/client";

import { prisma } from "@/lib/db/prisma";

function makeWorkspaceName(input?: string | null) {
  const trimmed = input?.trim();
  if (!trimmed) return "내 워크스페이스";
  return `${trimmed} 워크스페이스`;
}

function toSlugSeed(input?: string | null) {
  return (
    input
      ?.toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || ""
  );
}

async function createUniqueWorkspaceSlug(seed: string, userId: string) {
  const normalizedSeed = seed || `workspace-${userId.slice(0, 8)}`;
  let candidate = normalizedSeed;
  let sequence = 1;

  while (true) {
    const existing = await prisma.workspace.findUnique({
      where: { slug: candidate },
      select: { id: true },
    });
    if (!existing) return candidate;
    candidate = `${normalizedSeed}-${sequence}`;
    sequence += 1;
  }
}

export async function bootstrapUserWorkspace(input: {
  userId: string;
  userName?: string | null;
  userEmail?: string | null;
}) {
  const existingMembership = await prisma.membership.findFirst({
    where: { userId: input.userId },
    select: { id: true },
  });

  if (existingMembership) return;

  const workspaceName = makeWorkspaceName(input.userName);
  const slugSeed = toSlugSeed(input.userEmail?.split("@")[0] ?? input.userName);
  const slug = await createUniqueWorkspaceSlug(slugSeed, input.userId);

  await prisma.$transaction(async (tx) => {
    // 1. 워크스페이스 생성
    const workspace = await tx.workspace.create({
      data: { name: workspaceName, slug },
    });

    // 2. 멤버십 (OWNER) 생성
    await tx.membership.create({
      data: {
        userId: input.userId,
        workspaceId: workspace.id,
        role: MembershipRole.OWNER,
      },
    });

    // 3. FREE 구독 자동 생성
    await tx.subscription.create({
      data: {
        workspaceId: workspace.id,
        plan: SubscriptionPlan.FREE,
        status: SubscriptionStatus.ACTIVE,
        provider: "tosspayments",
      },
    });
  });
}
