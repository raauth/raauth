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

import { OrgChartEditor } from "@/components/organization/org-chart-editor";
import { OrgWorkspaceShell } from "@/components/organization/org-workspace-shell";
import { Badge } from "@/components/ui/badge";
import { getOrgChartPageData, getOrgChartSidebarData } from "@/server/actions/org-chart";
import { getOrganizations } from "@/server/actions/organizations";
import { getServerSession } from "@/server/actions/session";

export default async function HomePage() {
  const session = await getServerSession();

  if (!session) {
    redirect("/entrar");
  }

  const { organizations, preferredActiveOrganizationId } = await getOrganizations();
  const activeOrganization =
    organizations.find((organization) => organization.id === preferredActiveOrganizationId) ??
    organizations[0] ??
    null;

  if (!activeOrganization) {
    return (
      <div className="flex h-full min-h-0 items-center justify-center p-6">
        <div className="w-full max-w-lg rounded-xl border bg-card p-6 text-center">
          <h1 className="text-2xl font-semibold">Sem acesso a organizacao</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Sua conta esta autenticada, mas ainda nao foi vinculada a organizacao da empresa.
            Solicite acesso a um administrador.
          </p>
        </div>
      </div>
    );
  }

  const sidebarData = await getOrgChartSidebarData(activeOrganization.slug);
  if (!sidebarData) {
    return (
      <div className="flex h-full min-h-0 items-center justify-center p-6">
        <div className="w-full max-w-lg rounded-xl border bg-card p-6 text-center">
          <h1 className="text-2xl font-semibold">Nao foi possivel carregar a organizacao</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Atualize a pagina ou tente novamente em instantes.
          </p>
        </div>
      </div>
    );
  }

  const firstChart = sidebarData.groups[0]?.sectors[0];

  if (!firstChart) {
    return (
      <OrgWorkspaceShell
        organizationName={sidebarData.organization.name}
        organizationSlug={sidebarData.organization.slug}
        canEdit={sidebarData.canEdit}
        groups={sidebarData.groups}
      >
        <div className="flex h-full w-full items-center justify-center rounded-xl border bg-card p-4">
          <p className="text-sm text-muted-foreground">
            Nenhum organograma disponivel para a organizacao ativa.
          </p>
        </div>
      </OrgWorkspaceShell>
    );
  }

  const pageData = await getOrgChartPageData({
    organizationSlug: activeOrganization.slug,
    citySlug: firstChart.citySlug,
    sectorSlug: firstChart.sectorSlug,
  });

  if (!pageData) {
    return (
      <OrgWorkspaceShell
        organizationName={sidebarData.organization.name}
        organizationSlug={sidebarData.organization.slug}
        canEdit={sidebarData.canEdit}
        groups={sidebarData.groups}
      >
        <div className="flex h-full w-full items-center justify-center rounded-xl border bg-card p-4">
          <p className="text-sm text-muted-foreground">
            Nao foi possivel carregar o organograma inicial.
          </p>
        </div>
      </OrgWorkspaceShell>
    );
  }

  return (
    <OrgWorkspaceShell
      organizationName={sidebarData.organization.name}
      organizationSlug={sidebarData.organization.slug}
      canEdit={sidebarData.canEdit}
      groups={sidebarData.groups}
    >
      <div className="flex h-full min-h-0 w-full flex-1 flex-col gap-3 rounded-xl border bg-card p-3">
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
    </OrgWorkspaceShell>
  );
}
