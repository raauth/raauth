import { Account } from "@/components/account/account";
import { OrgChartSidebar } from "@/components/organization/org-chart-sidebar";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import type { OrgChartCityGroup } from "@/lib/org-chart-navigation";

interface OrgWorkspaceShellProps {
  organizationName: string;
  organizationSlug: string;
  canEdit: boolean;
  groups: OrgChartCityGroup[];
  title?: string;
  children: React.ReactNode;
}

export function OrgWorkspaceShell({
  organizationName,
  organizationSlug,
  canEdit,
  groups,
  title = "Organograma por cidade e setor",
  children,
}: OrgWorkspaceShellProps) {
  return (
    <SidebarProvider className="h-svh w-full overflow-hidden rounded-xl border">
      <OrgChartSidebar
        organizationName={organizationName}
        organizationSlug={organizationSlug}
        canEdit={canEdit}
        groups={groups}
        sidebarChrome={
          <div className="flex items-center justify-end gap-2">
            <Account organizationSlug={organizationSlug} />
            <ThemeToggle />
          </div>
        }
      />

      <SidebarInset className="h-full min-h-0 overflow-hidden">
        <div className="flex h-12 shrink-0 items-center gap-2 border-b px-3">
          <SidebarTrigger />
          <p className="text-sm text-muted-foreground">{title}</p>
        </div>
        <div className="flex flex-1 min-h-0 overflow-hidden p-3">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}
