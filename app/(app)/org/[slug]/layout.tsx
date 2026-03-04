import { notFound } from "next/navigation";

import { OrgWorkspaceShell } from "@/components/organization/org-workspace-shell";
import { OrgWorkspaceTitle } from "@/components/organization/org-workspace-title";
import { getOrgChartSidebarData } from "@/server/actions/org-chart";

type Params = Promise<{ slug: string }>;

export default async function OrganizationWorkspaceLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Params;
}>) {
  const { slug } = await params;
  const sidebarData = await getOrgChartSidebarData(slug);

  if (!sidebarData) {
    notFound();
  }

  return (
    <OrgWorkspaceShell
      organizationName={sidebarData.organization.name}
      organizationSlug={sidebarData.organization.slug}
      canEdit={sidebarData.canEdit}
      groups={sidebarData.groups}
      title={
        <OrgWorkspaceTitle
          organizationSlug={sidebarData.organization.slug}
          groups={sidebarData.groups}
          fallbackTitle="Workspace da organizacao"
        />
      }
    >
      {children}
    </OrgWorkspaceShell>
  );
}
