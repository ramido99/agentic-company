import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth/config";

export async function getAuthSession() {
  return getServerSession(authOptions);
}

export { authOptions };
