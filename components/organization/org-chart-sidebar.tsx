"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
import {
  Building2,
  ChevronRight,
  FolderTree,
  LayoutDashboard,
  Network,
  Pencil,
  Plus,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";

import { buildOrgChartPath, type OrgChartCityGroup } from "@/lib/org-chart-navigation";
import { cn } from "@/lib/utils";
import {
  createOrgChartCity,
  createOrgChartSector,
  deleteOrgChartCity,
  deleteOrgChartSector,
  renameOrgChartCity,
  renameOrgChartSector,
} from "@/server/actions/org-chart";
import { Button } from "@/components/ui/button";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
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

interface OrgChartSectorActionTarget extends SectorDialogCity {
  chartId: string;
  sector: string;
  sectorSlug: string;
}

function renameCityReasonToMessage(reason: string | undefined) {
  switch (reason) {
    case "FORBIDDEN":
      return "Voce nao tem permissao para editar cidades.";
    case "CITY_REQUIRED":
      return "Informe um nome de cidade valido.";
    case "CITY_NOT_FOUND":
      return "Nao encontramos essa cidade no organograma.";
    case "CITY_CONFLICT":
      return "Ja existe conflito de setores com essa cidade.";
    default:
      return "Nao foi possivel atualizar a cidade.";
  }
}

function deleteCityReasonToMessage(reason: string | undefined) {
  switch (reason) {
    case "FORBIDDEN":
      return "Voce nao tem permissao para excluir cidades.";
    case "CITY_NOT_FOUND":
      return "Nao encontramos essa cidade no organograma.";
    default:
      return "Nao foi possivel excluir a cidade.";
  }
}

function renameSectorReasonToMessage(reason: string | undefined) {
  switch (reason) {
    case "FORBIDDEN":
      return "Voce nao tem permissao para editar setores.";
    case "SECTOR_REQUIRED":
      return "Informe um nome de setor valido.";
    case "SECTOR_NOT_FOUND":
      return "Nao encontramos esse setor no organograma.";
    case "SECTOR_CONFLICT":
      return "Ja existe um setor com esse nome nessa cidade.";
    default:
      return "Nao foi possivel atualizar o setor.";
  }
}

function deleteSectorReasonToMessage(reason: string | undefined) {
  switch (reason) {
    case "FORBIDDEN":
      return "Voce nao tem permissao para excluir setores.";
    case "SECTOR_NOT_FOUND":
      return "Nao encontramos esse setor no organograma.";
    default:
      return "Nao foi possivel excluir o setor.";
  }
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
  const [isEditCityDialogOpen, setEditCityDialogOpen] = useState(false);
  const [isDeleteCityDialogOpen, setDeleteCityDialogOpen] = useState(false);
  const [isEditSectorDialogOpen, setEditSectorDialogOpen] = useState(false);
  const [isDeleteSectorDialogOpen, setDeleteSectorDialogOpen] = useState(false);

  const [isCreatingCity, startCreatingCity] = useTransition();
  const [isCreatingSector, startCreatingSector] = useTransition();
  const [isRenamingCity, startRenamingCity] = useTransition();
  const [isDeletingCity, startDeletingCity] = useTransition();
  const [isRenamingSector, startRenamingSector] = useTransition();
  const [isDeletingSector, startDeletingSector] = useTransition();

  const [city, setCity] = useState("");
  const [sector, setSector] = useState("");
  const [editedCityName, setEditedCityName] = useState("");
  const [editedSectorName, setEditedSectorName] = useState("");
  const [sectorDialogCity, setSectorDialogCity] = useState<SectorDialogCity | null>(null);
  const [cityActionTarget, setCityActionTarget] = useState<SectorDialogCity | null>(null);
  const [sectorActionTarget, setSectorActionTarget] = useState<OrgChartSectorActionTarget | null>(
    null,
  );
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
      pageLinks.find((group) => group.sectors.some((sectorPage) => sectorPage.href === pathname))
        ?.citySlug ?? null,
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

  const openRenameCityDialog = (dialogCity: SectorDialogCity) => {
    if (!canEdit) return;

    setCityActionTarget(dialogCity);
    setEditedCityName(dialogCity.city);
    setEditCityDialogOpen(true);
  };

  const openDeleteCityDialog = (dialogCity: SectorDialogCity) => {
    if (!canEdit) return;

    setCityActionTarget(dialogCity);
    setDeleteCityDialogOpen(true);
  };

  const openRenameSectorDialog = (targetSector: OrgChartSectorActionTarget) => {
    if (!canEdit) return;

    setSectorActionTarget(targetSector);
    setEditedSectorName(targetSector.sector);
    setEditSectorDialogOpen(true);
  };

  const openDeleteSectorDialog = (targetSector: OrgChartSectorActionTarget) => {
    if (!canEdit) return;

    setSectorActionTarget(targetSector);
    setDeleteSectorDialogOpen(true);
  };

  const resetCityActionState = () => {
    setCityActionTarget(null);
    setEditedCityName("");
  };

  const resetSectorActionState = () => {
    setSectorActionTarget(null);
    setEditedSectorName("");
  };

  const hardNavigate = (path: string) => {
    if (typeof window !== "undefined") {
      window.location.assign(path);
      return;
    }

    router.push(path);
    router.refresh();
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

  const handleRenameCity = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!canEdit || isRenamingCity || !cityActionTarget) return;
    const cityName = editedCityName.trim();
    if (!cityName) return;

    startRenamingCity(async () => {
      const target = cityActionTarget;
      const result = await renameOrgChartCity({
        organizationSlug,
        citySlug: target.citySlug,
        city: cityName,
      });

      if (!result.success) {
        toast.error(renameCityReasonToMessage(result.reason));
        return;
      }

      setExpandedCities((currentState) => {
        const currentIsOpen = currentState[target.citySlug] ?? true;
        const nextState = { ...currentState };
        delete nextState[target.citySlug];
        nextState[result.citySlug] = currentIsOpen;
        return nextState;
      });

      setEditCityDialogOpen(false);
      resetCityActionState();
      hardNavigate(result.path);
      toast.success("Cidade atualizada com sucesso.");
    });
  };

  const handleDeleteCity = () => {
    if (!canEdit || isDeletingCity || !cityActionTarget) return;

    startDeletingCity(async () => {
      const target = cityActionTarget;
      const result = await deleteOrgChartCity({
        organizationSlug,
        citySlug: target.citySlug,
      });

      if (!result.success) {
        toast.error(deleteCityReasonToMessage(result.reason));
        return;
      }

      setExpandedCities((currentState) => {
        const nextState = { ...currentState };
        delete nextState[target.citySlug];
        return nextState;
      });

      setDeleteCityDialogOpen(false);
      resetCityActionState();
      hardNavigate(result.path);
      toast.success("Cidade excluida com sucesso.");
    });
  };

  const handleRenameSector = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!canEdit || isRenamingSector || !sectorActionTarget) return;
    const sectorName = editedSectorName.trim();
    if (!sectorName) return;

    startRenamingSector(async () => {
      const target = sectorActionTarget;
      const result = await renameOrgChartSector({
        organizationSlug,
        citySlug: target.citySlug,
        sectorSlug: target.sectorSlug,
        sector: sectorName,
      });

      if (!result.success) {
        toast.error(renameSectorReasonToMessage(result.reason));
        return;
      }

      setEditSectorDialogOpen(false);
      resetSectorActionState();
      hardNavigate(result.path);
      toast.success("Setor atualizado com sucesso.");
    });
  };

  const handleDeleteSector = () => {
    if (!canEdit || isDeletingSector || !sectorActionTarget) return;

    startDeletingSector(async () => {
      const target = sectorActionTarget;
      const result = await deleteOrgChartSector({
        organizationSlug,
        citySlug: target.citySlug,
        sectorSlug: target.sectorSlug,
      });

      if (!result.success) {
        toast.error(deleteSectorReasonToMessage(result.reason));
        return;
      }

      setDeleteSectorDialogOpen(false);
      resetSectorActionState();
      hardNavigate(result.path);
      toast.success("Setor excluido com sucesso.");
    });
  };

  return (
    <>
      <Sidebar variant="floating" collapsible="offcanvas">
        <SidebarHeader className="gap-2">
          {sidebarChrome && <div className="px-2 pt-1">{sidebarChrome}</div>}

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
                className="w-6 rounded-md border border-sidebar-border bg-sidebar text-sidebar-foreground/90 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
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
                  const cityIsActive = group.sectors.some((sectorPage) => pathname === sectorPage.href);

                  return (
                    <SidebarMenuItem key={group.citySlug}>
                      <ContextMenu>
                        <ContextMenuTrigger asChild>
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
                        </ContextMenuTrigger>

                        {canEdit && (
                          <ContextMenuContent>
                            <ContextMenuItem
                              onSelect={() =>
                                openRenameCityDialog({
                                  city: group.city,
                                  citySlug: group.citySlug,
                                })
                              }
                            >
                              <Pencil className="size-4" />
                              <span>Editar cidade</span>
                            </ContextMenuItem>
                            <ContextMenuSeparator />
                            <ContextMenuItem
                              variant="destructive"
                              onSelect={() =>
                                openDeleteCityDialog({
                                  city: group.city,
                                  citySlug: group.citySlug,
                                })
                              }
                            >
                              <Trash2 className="size-4" />
                              <span>Excluir cidade</span>
                            </ContextMenuItem>
                          </ContextMenuContent>
                        )}
                      </ContextMenu>

                      {canEdit && (
                        <SidebarMenuAction
                          className="w-6 rounded-md border border-sidebar-border bg-sidebar text-sidebar-foreground/90 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground peer-data-[active=true]/menu-button:opacity-100"
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
                        <SidebarMenuSub className="mx-0 ml-4 mt-0.5 border-sidebar-border/70 px-2.5">
                          {group.sectors.map((sectorPage) => (
                            <SidebarMenuSubItem key={sectorPage.chartId}>
                              <ContextMenu>
                                <ContextMenuTrigger asChild>
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
                                </ContextMenuTrigger>

                                {canEdit && (
                                  <ContextMenuContent>
                                    <ContextMenuItem
                                      onSelect={() =>
                                        openRenameSectorDialog({
                                          chartId: sectorPage.chartId,
                                          city: group.city,
                                          citySlug: sectorPage.citySlug,
                                          sector: sectorPage.sector,
                                          sectorSlug: sectorPage.sectorSlug,
                                        })
                                      }
                                    >
                                      <Pencil className="size-4" />
                                      <span>Editar setor</span>
                                    </ContextMenuItem>
                                    <ContextMenuSeparator />
                                    <ContextMenuItem
                                      variant="destructive"
                                      onSelect={() =>
                                        openDeleteSectorDialog({
                                          chartId: sectorPage.chartId,
                                          city: group.city,
                                          citySlug: sectorPage.citySlug,
                                          sector: sectorPage.sector,
                                          sectorSlug: sectorPage.sectorSlug,
                                        })
                                      }
                                    >
                                      <Trash2 className="size-4" />
                                      <span>Excluir setor</span>
                                    </ContextMenuItem>
                                  </ContextMenuContent>
                                )}
                              </ContextMenu>
                            </SidebarMenuSubItem>
                          ))}
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

      <Dialog
        open={isEditCityDialogOpen}
        onOpenChange={(openState) => {
          setEditCityDialogOpen(openState);
          if (!openState) {
            resetCityActionState();
          }
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Editar cidade</DialogTitle>
            <DialogDescription>
              Atualize o nome da cidade e mantenha todos os setores vinculados.
            </DialogDescription>
          </DialogHeader>

          <form className="space-y-4" onSubmit={handleRenameCity}>
            <Input
              autoFocus
              value={editedCityName}
              onChange={(event) => setEditedCityName(event.target.value)}
              placeholder="Nome da cidade"
              maxLength={60}
              required
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setEditCityDialogOpen(false);
                  resetCityActionState();
                }}
                disabled={isRenamingCity}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={isRenamingCity || !cityActionTarget || editedCityName.trim().length === 0}
              >
                <Pencil className="size-4" />
                {isRenamingCity ? "Salvando..." : "Salvar cidade"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog
        open={isDeleteCityDialogOpen}
        onOpenChange={(openState) => {
          setDeleteCityDialogOpen(openState);
          if (!openState) {
            resetCityActionState();
          }
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Excluir cidade</DialogTitle>
            <DialogDescription>
              {cityActionTarget
                ? `Esta acao remove a cidade ${cityActionTarget.city} e todos os seus setores.`
                : "Selecione uma cidade para excluir."}
            </DialogDescription>
          </DialogHeader>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setDeleteCityDialogOpen(false);
                resetCityActionState();
              }}
              disabled={isDeletingCity}
            >
              Cancelar
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleDeleteCity}
              disabled={isDeletingCity || !cityActionTarget}
            >
              <Trash2 className="size-4" />
              {isDeletingCity ? "Excluindo..." : "Excluir cidade"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={isEditSectorDialogOpen}
        onOpenChange={(openState) => {
          setEditSectorDialogOpen(openState);
          if (!openState) {
            resetSectorActionState();
          }
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Editar setor</DialogTitle>
            <DialogDescription>
              {sectorActionTarget
                ? `Atualize o nome do setor em ${sectorActionTarget.city}.`
                : "Selecione um setor para editar."}
            </DialogDescription>
          </DialogHeader>

          <form className="space-y-4" onSubmit={handleRenameSector}>
            <Input
              autoFocus
              value={editedSectorName}
              onChange={(event) => setEditedSectorName(event.target.value)}
              placeholder="Nome do setor"
              maxLength={60}
              required
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setEditSectorDialogOpen(false);
                  resetSectorActionState();
                }}
                disabled={isRenamingSector}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={
                  isRenamingSector || !sectorActionTarget || editedSectorName.trim().length === 0
                }
              >
                <Pencil className="size-4" />
                {isRenamingSector ? "Salvando..." : "Salvar setor"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog
        open={isDeleteSectorDialogOpen}
        onOpenChange={(openState) => {
          setDeleteSectorDialogOpen(openState);
          if (!openState) {
            resetSectorActionState();
          }
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Excluir setor</DialogTitle>
            <DialogDescription>
              {sectorActionTarget
                ? `Esta acao remove o setor ${sectorActionTarget.sector} da cidade ${sectorActionTarget.city}.`
                : "Selecione um setor para excluir."}
            </DialogDescription>
          </DialogHeader>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setDeleteSectorDialogOpen(false);
                resetSectorActionState();
              }}
              disabled={isDeletingSector}
            >
              Cancelar
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleDeleteSector}
              disabled={isDeletingSector || !sectorActionTarget}
            >
              <Trash2 className="size-4" />
              {isDeletingSector ? "Excluindo..." : "Excluir setor"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
