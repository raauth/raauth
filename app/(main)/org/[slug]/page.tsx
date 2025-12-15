// libs e funções:
import { getOrganizationBySlug } from "@/auth/actions/organizations";
import { getAllUsers } from "@/auth/actions/users";

// componentes
import { AllMembers } from "@/components/organization/tables/members/all-members";
import { AllUsers } from "@/components/organization/tables/users/all-users";

type Params = Promise<{ slug: string }>;

export default async function OrganizationPage({ params }: { params: Params }) {
  const { slug } = await params;
  const [organization, users] = await Promise.all([
    getOrganizationBySlug(slug),
    getAllUsers(),
  ]);

  return (
    <div className="flex flex-col gap-4">
      <AllMembers members={organization?.members || []} />
      <AllUsers users={users || []} />
    </div>
  );
}