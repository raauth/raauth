import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/account-actions/user";

export async function getOrganizations() {
  const { currentUser } = await getCurrentUser();

  const members = await db.member.findMany({
    where: {
      userId: currentUser.id,
    },
  });

  const organizations = await db.organization.findMany({
    where: {
      id: {
        in: members.map((member) => member.organizationId),
      },
    },
  });

  const hasSingleOrganization = organizations.length === 1;
  const preferredActiveOrganizationId = hasSingleOrganization
    ? organizations[0].id
    : currentUser.lastActiveOrganizationId &&
        organizations.some((organization) => organization.id === currentUser.lastActiveOrganizationId)
      ? currentUser.lastActiveOrganizationId
      : null;

  if (currentUser.lastActiveOrganizationId !== preferredActiveOrganizationId) {
    await db.user.update({
      where: { id: currentUser.id },
      data: { lastActiveOrganizationId: preferredActiveOrganizationId },
    });
  }

  return {
    organizations,
    preferredActiveOrganizationId,
  };
}
