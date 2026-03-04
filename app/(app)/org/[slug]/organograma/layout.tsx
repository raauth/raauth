import { notFound } from "next/navigation";

import { Account } from "@/components/account/account";
import { OrgChartSidebar } from "@/components/organization/org-chart-sidebar";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { getOrgChartSidebarData } from "@/server/actions/org-chart";

type Params = Promise<{ slug: string }>;

export default async function OrganizationChartWorkspaceLayout({
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
    <SidebarProvider className="h-[calc(100svh-2rem)] w-full overflow-hidden rounded-xl border">
      <OrgChartSidebar
        organizationName={sidebarData.organization.name}
        organizationSlug={sidebarData.organization.slug}
        canEdit={sidebarData.canEdit}
        groups={sidebarData.groups}
        sidebarChrome={
          <div className="flex items-center justify-end gap-2">
            <Account />
            <ThemeToggle />
          </div>
        }
      />

      <SidebarInset className="h-full min-h-0 overflow-hidden">
        <div className="flex h-12 items-center gap-2 border-b px-3">
          <SidebarTrigger />
          <p className="text-sm text-muted-foreground">
            Organograma por cidade e setor
          </p>
        </div>
        <div className="flex flex-1 min-h-0 overflow-hidden p-3">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}
