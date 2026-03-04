"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
import { Building2, ChevronRight, FolderTree, LayoutDashboard, Network, Plus } from "lucide-react";
import { toast } from "sonner";

import { buildOrgChartPath, type OrgChartCityGroup } from "@/lib/org-chart-navigation";
import { cn } from "@/lib/utils";
import { createOrgChartCity, createOrgChartSector } from "@/server/actions/org-chart";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupAction,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
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

interface SectorDialogCity {
  city: string;
  citySlug: string;
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
  const [isCityDialogOpen, setCityDialogOpen] = useState(false);
  const [isSectorDialogOpen, setSectorDialogOpen] = useState(false);
  const [isCreatingCity, startCreatingCity] = useTransition();
  const [isCreatingSector, startCreatingSector] = useTransition();
  const [city, setCity] = useState("");
  const [sector, setSector] = useState("");
  const [sectorDialogCity, setSectorDialogCity] = useState<SectorDialogCity | null>(null);
  const [expandedCities, setExpandedCities] = useState<Record<string, boolean>>({});

  const managementPath = `/org/${organizationSlug}`;

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

  const activeCitySlug = useMemo(
    () =>
      pageLinks.find((group) =>
        group.sectors.some((sectorPage) => sectorPage.href === pathname),
      )?.citySlug ?? null,
    [pageLinks, pathname],
  );

  const toggleCityOpenState = (citySlug: string) => {
    setExpandedCities((currentState) => {
      const currentIsOpen =
        currentState[citySlug] ??
        (citySlug === activeCitySlug || pageLinks[0]?.citySlug === citySlug);

      return {
        ...currentState,
        [citySlug]: !currentIsOpen,
      };
    });
  };

  const openSectorDialog = (dialogCity: SectorDialogCity) => {
    if (!canEdit) return;

    setSectorDialogCity(dialogCity);
    setSector("");
    setSectorDialogOpen(true);
  };

  const handleCreateCity = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!canEdit || isCreatingCity) return;
    const cityName = city.trim();
    if (!cityName) return;

    startCreatingCity(async () => {
      const result = await createOrgChartCity({
        organizationSlug,
        city: cityName,
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
      setCityDialogOpen(false);
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
    if (!canEdit || isCreatingSector || !sectorDialogCity) return;
    const sectorName = sector.trim();
    if (!sectorName) return;

    startCreatingSector(async () => {
      const result = await createOrgChartSector({
        organizationSlug,
        citySlug: sectorDialogCity.citySlug,
        sector: sectorName,
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
      setSectorDialogOpen(false);
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
    <>
      <Sidebar variant="inset" collapsible="icon">
        <SidebarHeader className="gap-1">
          {sidebarChrome && (
            <>
              <div className="px-2 pt-1">{sidebarChrome}</div>
              <SidebarSeparator />
            </>
          )}

          <div className="flex items-center gap-2 px-2 py-1.5">
            <Building2 className="size-4 text-muted-foreground" />
            <span className="truncate text-sm font-medium">{organizationName}</span>
          </div>
        </SidebarHeader>

        <SidebarSeparator />

        <SidebarContent>
          <SidebarGroup className="pt-1">
            <SidebarGroupLabel>Navegacao</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild isActive={pathname === managementPath} className="h-9">
                    <Link href={managementPath}>
                      <LayoutDashboard />
                      <span>Gerenciar organizacao</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          <SidebarGroup>
            <SidebarGroupLabel>Estrutura</SidebarGroupLabel>
            {canEdit && (
              <SidebarGroupAction
                aria-label="Criar cidade"
                title="Criar cidade"
                onClick={() => setCityDialogOpen(true)}
              >
                <Plus className="size-4" />
              </SidebarGroupAction>
            )}

            <SidebarGroupContent>
              <SidebarMenu>
                {pageLinks.map((group, index) => {
                  const cityIsOpen =
                    expandedCities[group.citySlug] ??
                    (group.citySlug === activeCitySlug || index === 0);
                  const cityIsActive = group.sectors.some(
                    (sectorPage) => pathname === sectorPage.href,
                  );

                  return (
                    <SidebarMenuItem key={group.citySlug}>
                      <SidebarMenuButton
                        isActive={cityIsActive}
                        className="h-9 pr-8"
                        onClick={() => toggleCityOpenState(group.citySlug)}
                      >
                        <ChevronRight
                          className={cn(
                            "size-4 transition-transform duration-200",
                            cityIsOpen && "rotate-90",
                          )}
                        />
                        <FolderTree className="size-4" />
                        <span className="truncate">{group.city}</span>
                      </SidebarMenuButton>

                      {canEdit && (
                        <SidebarMenuAction
                          showOnHover
                          className="peer-data-[active=true]/menu-button:opacity-100"
                          aria-label={`Criar setor em ${group.city}`}
                          title={`Criar setor em ${group.city}`}
                          onClick={(event) => {
                            event.stopPropagation();
                            openSectorDialog({
                              city: group.city,
                              citySlug: group.citySlug,
                            });
                          }}
                        >
                          <Plus className="size-4" />
                        </SidebarMenuAction>
                      )}

                      {cityIsOpen && (
                        <SidebarMenuSub>
                          {group.sectors.map((sectorPage) => (
                            <SidebarMenuSubItem key={sectorPage.chartId}>
                              <SidebarMenuSubButton
                                asChild
                                isActive={pathname === sectorPage.href}
                                size="md"
                                className="h-8"
                              >
                                <Link href={sectorPage.href}>
                                  <Network className="size-4" />
                                  <span>{sectorPage.sector}</span>
                                </Link>
                              </SidebarMenuSubButton>
                            </SidebarMenuSubItem>
                          ))}

                          {canEdit && (
                            <SidebarMenuSubItem>
                              <SidebarMenuSubButton asChild className="h-8">
                                <button
                                  type="button"
                                  className="cursor-pointer"
                                  onClick={() =>
                                    openSectorDialog({
                                      city: group.city,
                                      citySlug: group.citySlug,
                                    })
                                  }
                                >
                                  <Plus className="size-4" />
                                  <span>Novo setor</span>
                                </button>
                              </SidebarMenuSubButton>
                            </SidebarMenuSubItem>
                          )}
                        </SidebarMenuSub>
                      )}
                    </SidebarMenuItem>
                  );
                })}

                {pageLinks.length === 0 && (
                  <SidebarMenuItem>
                    <div className="rounded-md border border-dashed px-3 py-2 text-xs text-muted-foreground">
                      Nenhuma cidade cadastrada.
                    </div>
                  </SidebarMenuItem>
                )}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

        {canEdit && (
          <SidebarFooter className="group-data-[collapsible=icon]:hidden">
            <Button
              size="sm"
              variant="outline"
              className="w-full justify-start"
              onClick={() => setCityDialogOpen(true)}
            >
              <Plus className="size-4" />
              Nova cidade
            </Button>
          </SidebarFooter>
        )}

        <SidebarRail />
      </Sidebar>

      <Dialog open={isCityDialogOpen} onOpenChange={setCityDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Criar cidade</DialogTitle>
            <DialogDescription>
              Crie um grupo principal para organizar os setores do organograma.
            </DialogDescription>
          </DialogHeader>

          <form className="space-y-4" onSubmit={handleCreateCity}>
            <Input
              autoFocus
              value={city}
              onChange={(event) => setCity(event.target.value)}
              placeholder="Nome da cidade"
              maxLength={60}
              required
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setCityDialogOpen(false)}
                disabled={isCreatingCity}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isCreatingCity || city.trim().length === 0}>
                <Plus className="size-4" />
                {isCreatingCity ? "Criando..." : "Criar cidade"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog
        open={isSectorDialogOpen}
        onOpenChange={(openState) => {
          setSectorDialogOpen(openState);
          if (!openState) {
            setSector("");
          }
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Criar setor</DialogTitle>
            <DialogDescription>
              {sectorDialogCity
                ? `Novo setor dentro de ${sectorDialogCity.city}.`
                : "Selecione uma cidade para criar o setor."}
            </DialogDescription>
          </DialogHeader>

          <form className="space-y-4" onSubmit={handleCreateSector}>
            <Input
              autoFocus
              value={sector}
              onChange={(event) => setSector(event.target.value)}
              placeholder="Nome do setor"
              maxLength={60}
              required
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setSectorDialogOpen(false)}
                disabled={isCreatingSector}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={isCreatingSector || !sectorDialogCity || sector.trim().length === 0}
              >
                <Plus className="size-4" />
                {isCreatingSector ? "Criando..." : "Criar setor"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
