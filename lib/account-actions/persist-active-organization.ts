"use server";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { headers } from "next/headers";

export async function persistActiveOrganization(organizationId: string | null) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return { ok: false as const, reason: "UNAUTHORIZED" as const };
  }

  if (!organizationId) {
    await db.user.update({
      where: { id: session.user.id },
      data: { lastActiveOrganizationId: null },
    });

    return { ok: true as const };
  }

  const membership = await db.member.findFirst({
    where: {
      userId: session.user.id,
      organizationId,
    },
  });

  if (!membership) {
    return { ok: false as const, reason: "NOT_A_MEMBER" as const };
  }

  await db.user.update({
    where: { id: session.user.id },
    data: { lastActiveOrganizationId: organizationId },
  });

  return { ok: true as const };
}
