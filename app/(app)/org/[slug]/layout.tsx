import { notFound } from "next/navigation";

import { OrgChartSidebar } from "@/components/organization/org-chart-sidebar";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
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
    <SidebarProvider className="!min-h-[calc(100dvh-var(--header-h)-2rem)] overflow-hidden rounded-xl border">
      <OrgChartSidebar
        organizationName={sidebarData.organization.name}
        organizationSlug={sidebarData.organization.slug}
        role={sidebarData.role}
        canEdit={sidebarData.canEdit}
        groups={sidebarData.groups}
      />
      <SidebarInset>
        <div className="flex h-12 items-center gap-2 border-b px-3">
          <SidebarTrigger />
          <p className="text-sm text-muted-foreground">
            Organograma por cidade e setor
          </p>
        </div>
        <div className="flex-1 overflow-auto p-4">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}
