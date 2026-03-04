"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
import { Building2, LayoutDashboard, Network, Plus, PlusCircle } from "lucide-react";
import { toast } from "sonner";

import { buildOrgChartPath, type OrgChartCityGroup } from "@/lib/org-chart-navigation";
import { createOrgChartCity, createOrgChartSector } from "@/server/actions/org-chart";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  canEdit: boolean;
  groups: OrgChartCityGroup[];
  sidebarChrome?: React.ReactNode;
}

export function OrgChartSidebar({
  organizationName,
  organizationSlug,
  canEdit,
  groups,
  sidebarChrome,
}: OrgChartSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [isCreatingCity, startCreatingCity] = useTransition();
  const [isCreatingSector, startCreatingSector] = useTransition();
  const [city, setCity] = useState("");
  const [sector, setSector] = useState("");
  const [selectedCitySlug, setSelectedCitySlug] = useState("");

  const managementPath = `/org/${organizationSlug}`;
  const cityOptions = useMemo(
    () =>
      groups.map((group) => ({
        city: group.city,
        citySlug: group.citySlug,
      })),
    [groups],
  );

  const selectedCitySlugValue = useMemo(() => {
    if (cityOptions.length === 0) return "";
    if (cityOptions.some((option) => option.citySlug === selectedCitySlug)) {
      return selectedCitySlug;
    }
    return cityOptions[0].citySlug;
  }, [cityOptions, selectedCitySlug]);

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

  const handleCreateCity = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!canEdit || isCreatingCity) return;

    startCreatingCity(async () => {
      const result = await createOrgChartCity({
        organizationSlug,
        city,
      });

      if (!result.success) {
        if (result.reason === "FORBIDDEN") {
          toast.error("Voce nao tem permissao para criar cidades.");
          return;
        }

        toast.error("Nao foi possivel criar a cidade.");
        return;
      }

      setCity("");
      router.push(result.path);
      router.refresh();
      toast.success(
        result.alreadyExists
          ? "Cidade ja existente. Abrimos o organograma dela."
          : "Cidade criada com sucesso.",
      );
    });
  };

  const handleCreateSector = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!canEdit || isCreatingSector || !selectedCitySlugValue) return;

    startCreatingSector(async () => {
      const result = await createOrgChartSector({
        organizationSlug,
        citySlug: selectedCitySlugValue,
        sector,
      });

      if (!result.success) {
        if (result.reason === "FORBIDDEN") {
          toast.error("Voce nao tem permissao para criar setores.");
          return;
        }
        if (result.reason === "CITY_NOT_FOUND") {
          toast.error("Selecione uma cidade valida para criar o setor.");
          return;
        }

        toast.error("Nao foi possivel criar o setor.");
        return;
      }

      setSector("");
      router.push(result.path);
      router.refresh();
      toast.success(
        result.alreadyExists
          ? "Setor ja existente. Abrimos o organograma dele."
          : "Setor criado com sucesso.",
      );
    });
  };

  return (
    <Sidebar variant="inset" collapsible="icon">
      <SidebarHeader className="gap-2">
        {sidebarChrome && (
          <>
            <div className="px-2">{sidebarChrome}</div>
            <SidebarSeparator />
          </>
        )}

        <div className="flex items-center gap-2 px-2 py-1">
          <Building2 className="size-4" />
          <span className="truncate text-sm font-medium">{organizationName}</span>
        </div>
      </SidebarHeader>

      <SidebarSeparator />

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navegacao</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={pathname === managementPath}>
                  <Link href={managementPath}>
                    <LayoutDashboard />
                    <span>Gerenciar organizacao</span>
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
        <SidebarFooter className="gap-2 group-data-[collapsible=icon]:hidden">
          <form className="flex flex-col gap-2 rounded-md border p-2" onSubmit={handleCreateCity}>
            <p className="text-xs font-medium text-muted-foreground">Criar cidade</p>
            <Input
              value={city}
              onChange={(event) => setCity(event.target.value)}
              placeholder="Nome da cidade"
              maxLength={60}
              required
            />
            <Button type="submit" size="sm" disabled={isCreatingCity}>
              <Plus className="size-4" />
              {isCreatingCity ? "Criando..." : "Criar cidade"}
            </Button>
          </form>

          <form className="flex flex-col gap-2 rounded-md border p-2" onSubmit={handleCreateSector}>
            <p className="text-xs font-medium text-muted-foreground">Criar setor</p>

            <Select
              value={selectedCitySlugValue}
              onValueChange={setSelectedCitySlug}
              disabled={cityOptions.length === 0}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Selecione a cidade" />
              </SelectTrigger>
              <SelectContent>
                {cityOptions.map((option) => (
                  <SelectItem key={option.citySlug} value={option.citySlug}>
                    {option.city}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Input
              value={sector}
              onChange={(event) => setSector(event.target.value)}
              placeholder="Nome do setor"
              maxLength={60}
              required
            />

            <Button
              type="submit"
              size="sm"
              disabled={isCreatingSector || cityOptions.length === 0}
            >
              <PlusCircle className="size-4" />
              {isCreatingSector ? "Criando..." : "Criar setor"}
            </Button>
          </form>
        </SidebarFooter>
      )}

      <SidebarRail />
    </Sidebar>
  );
}
