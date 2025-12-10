import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/account-actions/user";

export async function getOrganizations() {
  const { currentUser } = await getCurrentUser();

  const members = await db.member.findMany({
    where: {
      userId: currentUser.id,
    },
    include: {
      organization: true,
    },
  });

  const organizations = await db.organization.findMany({
    where: {
      id: {
        in: members.map((member) => member.organizationId),
      },
    },
  });

  return organizations;
}
