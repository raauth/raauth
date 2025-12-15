// libs e funções:
import { getOrganizationBySlug } from "@/auth/actions/organizations";
import { getAllUsers } from "@/auth/actions/users";
import { InfosCard } from "@/components/organization/infos-card";

// componentes
import { AllMembers } from "@/components/organization/tables/members/all-members";
import { AllUsers } from "@/components/organization/tables/users/all-users";

type Params = Promise<{ slug: string }>;

export default async function OrganizationPage({ params }: { params: Params }) {
  const { slug } = await params;
  const organization = await getOrganizationBySlug(slug);
  const users = await getAllUsers(organization?.id || "");

  return (
    <div className="flex flex-col lg:grid lg:grid-cols-5 gap-8">
      <div className="flex flex-col gap-4 col-span-3">
        <AllMembers members={organization?.members || []} />
        <AllUsers users={users || []} />
      </div>
      <div className="flex flex-col gap-4 col-span-2">
        {/* <InfosCard org={organization?. || {}} /> */}
        {organization && (
          <InfosCard organization={organization} />
        )}
      </div>
    </div>
  );
}
