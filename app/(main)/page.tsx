import { getServerSession } from "@/auth/actions/session";
import { getDashboardsByOrganization } from "@/auth/actions/dashboards";
import { DashboardsCard } from "@/app/(main)/dashboards-cards/dashboard-card";
import { db } from "@/lib/db";

export default async function Page() {
  const session = await getServerSession();

  // Se não há organização ativa, mostra mensagem
  if (!session?.session?.activeOrganizationId) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center">
        <h2 className="text-2xl font-bold mb-2">Bem-vindo ao RAAuth</h2>
        <p className="text-muted-foreground">
          Selecione uma organização para ver os dashboards disponíveis.
        </p>
      </div>
    );
  }

  // Busca a role do usuário na organização ativa
  const member = await db.member.findFirst({
    where: {
      userId: session.user.id,
      organizationId: session.session.activeOrganizationId,
    },
  });

  const userRole = member?.role || "member";

  // Busca dashboards da organização ativa, filtrados pela role
  const dashboards = await getDashboardsByOrganization(
    session.session.activeOrganizationId,
    userRole
  );

  if (dashboards.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center">
        <h2 className="text-2xl font-bold mb-2">Nenhum dashboard disponível</h2>
        <p className="text-muted-foreground">
          Não há dashboards configurados para esta organização ainda.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {dashboards.map((dashboard) => (
        <DashboardsCard
          key={dashboard.id}
          title={dashboard.name}
          description={dashboard.description || "Acesse este dashboard"}
          href={`/dashboard/${dashboard.id}`}
        />
      ))}
    </div>
  );
}
