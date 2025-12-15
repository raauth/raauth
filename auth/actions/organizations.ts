import { db } from "@/lib/db"

export async function getOrganizationBySlug(slug: string) {
  try {
    const organizationBySlug = await db.organization.findUnique({
      where: {
        slug: slug
      },
      include: { members: { include: { user: true } } }
    });

    return organizationBySlug
  } catch (error) {
    console.log(error)
    return null;
  }
}