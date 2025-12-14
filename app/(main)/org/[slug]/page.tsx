import { getOrganizationBySlug } from "@/auth/actions/organizations";
import { MembersTable } from "@/components/organization/members-table";
import { getAllUsers } from "@/auth/actions/users";
import { AllUsers } from "@/components/organization/all-users";

type Params = Promise<{ slug: string }>;

export default async function OrganizationPage({ params }: { params: Params }) {
  const { slug } = await params;
  const [ organization, users ] = await Promise.all([
    getOrganizationBySlug(slug),
    getAllUsers(),
  ]);

  return(
    <>
      <h2 className="text-2xl font-bold font-averia">{organization?.name}</h2>
      <MembersTable members={organization?.members || []} />
      <AllUsers users={users || []} />
    </>
  );
}