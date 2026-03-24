import { prisma } from "@/lib/db/prisma";

const DEFAULT_WORKSPACE_SLUG = "default";
const DEFAULT_WORKSPACE_NAME = "Default Workspace";

/**
 * Returns the default workspace, creating it if it doesn't exist.
 * Used for demo / unauthenticated flows.
 */
export async function getOrCreateDefaultWorkspace() {
  return prisma.workspace.upsert({
    where: { slug: DEFAULT_WORKSPACE_SLUG },
    update: {},
    create: {
      slug: DEFAULT_WORKSPACE_SLUG,
      name: DEFAULT_WORKSPACE_NAME,
    },
  });
}

export async function getDefaultWorkspaceId(): Promise<string> {
  const workspace = await getOrCreateDefaultWorkspace();
  return workspace.id;
}
