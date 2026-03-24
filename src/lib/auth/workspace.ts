import { redirect } from "next/navigation";

import { getAuthSession } from "@/lib/auth";
import { prisma } from "@/lib/db/prisma";

export async function getCurrentWorkspaceMembership() {
  const session = await getAuthSession();
  const userId = session?.user?.id;

  if (!userId) {
    return null;
  }

  return prisma.membership.findFirst({
    where: { userId },
    include: {
      workspace: true,
    },
    orderBy: {
      createdAt: "asc",
    },
  });
}

export async function getCurrentWorkspace() {
  const membership = await getCurrentWorkspaceMembership();
  return membership?.workspace ?? null;
}

export async function requireCurrentWorkspace() {
  const workspace = await getCurrentWorkspace();

  if (!workspace) {
    redirect("/sign-in");
  }

  return workspace;
}
