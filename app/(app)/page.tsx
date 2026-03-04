// ============================================================
// 🏠 PÁGINA INICIAL (Home Page)
// ============================================================
// Esta é a primeira página que o usuário vê após fazer login.
// Mostra uma mensagem de boas-vindas e informações sobre
// a organização ativa (se houver uma selecionada).
//
// 📌 COMPORTAMENTO:
// - Sem org ativa → mostra prompt para selecionar uma
// - Com org ativa → mostra painel de boas-vindas com dados
//
// 💡 PONTO DE EXTENSÃO: ao fazer fork deste projeto, esta
// é a página que você vai personalizar para o seu caso de
// uso. Pode adicionar:
// - Dashboard com métricas
// - Lista de itens recentes
// - Atalhos rápidos
// - Qualquer conteúdo específico do seu projeto
// ============================================================

import { redirect } from "next/navigation";

import { Account } from "@/components/account/account";
import { OrgChartEditor } from "@/components/organization/org-chart-editor";
import { OrgChartSidebar } from "@/components/organization/org-chart-sidebar";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { Badge } from "@/components/ui/badge";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { db } from "@/lib/db";
import { getOrgChartPageData, getOrgChartSidebarData } from "@/server/actions/org-chart";
import { getServerSession } from "@/server/actions/session";

export default async function HomePage() {
  const session = await getServerSession();

  if (!session?.session?.activeOrganizationId) {
    redirect("/criar-organizacao");
  }

  const activeOrganization = await db.organization.findUnique({
    where: {
      id: session.session.activeOrganizationId,
    },
    select: {
      slug: true,
      name: true,
    },
  });

  if (!activeOrganization) {
    redirect("/criar-organizacao");
  }

  const sidebarData = await getOrgChartSidebarData(activeOrganization.slug);
  if (!sidebarData) {
    redirect("/criar-organizacao");
  }

  const firstChart = sidebarData.groups[0]?.sectors[0];

  if (!firstChart) {
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
          <div className="flex flex-1 min-h-0 items-center justify-center p-4">
            <p className="text-sm text-muted-foreground">
              Nenhum organograma disponivel para a organizacao ativa.
            </p>
          </div>
        </SidebarInset>
      </SidebarProvider>
    );
  }

  const pageData = await getOrgChartPageData({
    organizationSlug: activeOrganization.slug,
    citySlug: firstChart.citySlug,
    sectorSlug: firstChart.sectorSlug,
  });

  if (!pageData) {
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
          <div className="flex flex-1 min-h-0 items-center justify-center p-4">
            <p className="text-sm text-muted-foreground">
              Nao foi possivel carregar o organograma inicial.
            </p>
          </div>
        </SidebarInset>
      </SidebarProvider>
    );
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
        <div className="flex flex-1 min-h-0 overflow-hidden p-3">
          <div className="flex h-full min-h-0 flex-col gap-3 rounded-xl border bg-card p-3">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="secondary">{pageData.chart.city}</Badge>
              <Badge variant="outline">{pageData.chart.sector}</Badge>
            </div>

            <div>
              <h1 className="text-2xl font-semibold">Organograma</h1>
              <p className="text-sm text-muted-foreground">
                Estrutura da organizacao para {pageData.chart.city} / {pageData.chart.sector}.
              </p>
            </div>

            <OrgChartEditor
              organizationSlug={pageData.organization.slug}
              chartId={pageData.chart.id}
              canEdit={pageData.canEdit}
              initialNodes={pageData.nodes}
              initialEdges={pageData.edges}
            />
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
