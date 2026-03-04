import type { CSSProperties } from "react";

import { Account } from "@/components/account/account";
import { OrgChartSidebar } from "@/components/organization/org-chart-sidebar";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import type { OrgChartCityGroup } from "@/lib/org-chart-navigation";

interface OrgWorkspaceShellProps {
  organizationName: string;
  organizationSlug: string;
  canEdit: boolean;
  groups: OrgChartCityGroup[];
  title?: React.ReactNode;
  children: React.ReactNode;
}

export function OrgWorkspaceShell({
  organizationName,
  organizationSlug,
  canEdit,
  groups,
  title = <p className="pt-1 text-sm text-muted-foreground">Organograma por cidade e setor</p>,
  children,
}: OrgWorkspaceShellProps) {
  const sidebarStyle = {
    "--sidebar-width": "19rem",
  } as CSSProperties;

  return (
    <SidebarProvider
      className="h-svh w-full overflow-hidden rounded-xl border"
      style={sidebarStyle}
    >
      <OrgChartSidebar
        organizationName={organizationName}
        organizationSlug={organizationSlug}
        canEdit={canEdit}
        groups={groups}
        sidebarChrome={
          <div className="w-full">
            <Account organizationSlug={organizationSlug} />
          </div>
        }
      />

      <SidebarInset className="h-full min-h-0 overflow-hidden">
        <div className="flex min-h-12 shrink-0 items-center gap-2 border-b px-3 py-2">
          <SidebarTrigger className="mt-0.5 shrink-0" />
          <div className="min-w-0 flex-1">{title}</div>
          <div
            id="org-workspace-header-actions"
            className="flex shrink-0 items-center gap-2"
            aria-label="Acoes do organograma"
          />
        </div>
        <div className="flex flex-1 min-h-0 overflow-hidden p-3">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}
