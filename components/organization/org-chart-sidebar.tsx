"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
import { Building2, LayoutDashboard, Network, Plus } from "lucide-react";
import { toast } from "sonner";

import { buildOrgChartPath, type OrgChartCityGroup } from "@/lib/org-chart-navigation";
import { createOrgChartPage } from "@/server/actions/org-chart";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarSeparator,
} from "@/components/ui/sidebar";

interface OrgChartSidebarProps {
  organizationName: string;
  organizationSlug: string;
  role: string;
  canEdit: boolean;
  groups: OrgChartCityGroup[];
}

function roleLabel(role: string) {
  switch (role) {
    case "owner":
      return "Owner";
    case "admin":
      return "Admin";
    default:
      return "Visualizador";
  }
}

export function OrgChartSidebar({
  organizationName,
  organizationSlug,
  role,
  canEdit,
  groups,
}: OrgChartSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [isCreating, startCreating] = useTransition();
  const [city, setCity] = useState("");
  const [sector, setSector] = useState("");

  const overviewPath = `/org/${organizationSlug}`;
  const pageLinks = useMemo(
    () =>
      groups.map((group) => ({
        ...group,
        sectors: group.sectors.map((sectorPage) => ({
          ...sectorPage,
          href: buildOrgChartPath({
            organizationSlug,
            citySlug: sectorPage.citySlug,
            sectorSlug: sectorPage.sectorSlug,
          }),
        })),
      })),
    [groups, organizationSlug],
  );

  const handleCreatePage = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!canEdit || isCreating) return;

    startCreating(async () => {
      const result = await createOrgChartPage({
        organizationSlug,
        city,
        sector,
      });

      if (!result.success) {
        if (result.reason === "FORBIDDEN") {
          toast.error("Voce nao tem permissao para criar paginas.");
          return;
        }

        toast.error("Nao foi possivel criar a pagina do organograma.");
        return;
      }

      setCity("");
      setSector("");
      router.push(result.path);
      router.refresh();
      toast.success("Pagina de organograma criada.");
    });
  };

  return (
    <Sidebar variant="inset" collapsible="icon">
      <SidebarHeader className="gap-1">
        <div className="flex items-center gap-2 px-2 py-1">
          <Building2 className="size-4" />
          <span className="truncate text-sm font-medium">{organizationName}</span>
        </div>
        <div className="px-2">
          <Badge variant="outline">{roleLabel(role)}</Badge>
        </div>
      </SidebarHeader>

      <SidebarSeparator />

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navegacao</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={pathname === overviewPath}>
                  <Link href={overviewPath}>
                    <LayoutDashboard />
                    <span>Visao geral</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {pageLinks.map((group) => (
          <SidebarGroup key={group.citySlug}>
            <SidebarGroupLabel>{group.city}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.sectors.map((sectorPage) => (
                  <SidebarMenuItem key={sectorPage.chartId}>
                    <SidebarMenuButton asChild isActive={pathname === sectorPage.href}>
                      <Link href={sectorPage.href}>
                        <Network />
                        <span>{sectorPage.sector}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      {canEdit && (
        <SidebarFooter className="group-data-[collapsible=icon]:hidden">
          <form className="flex flex-col gap-2 rounded-md border p-2" onSubmit={handleCreatePage}>
            <p className="text-xs font-medium text-muted-foreground">
              Nova pagina (cidade/setor)
            </p>
            <Input
              value={city}
              onChange={(event) => setCity(event.target.value)}
              placeholder="Cidade"
              maxLength={60}
              required
            />
            <Input
              value={sector}
              onChange={(event) => setSector(event.target.value)}
              placeholder="Setor"
              maxLength={60}
              required
            />
            <Button type="submit" size="sm" disabled={isCreating}>
              <Plus className="size-4" />
              {isCreating ? "Criando..." : "Criar pagina"}
            </Button>
          </form>
        </SidebarFooter>
      )}

      <SidebarRail />
    </Sidebar>
  );
}
