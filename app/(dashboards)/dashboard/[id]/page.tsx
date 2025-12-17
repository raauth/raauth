import { notFound, redirect } from "next/navigation";
import { getServerSession } from "@/auth/actions/session";
import { db } from "@/lib/db";

type Params = Promise<{ id: string }>;

// Hierarquia de roles para comparação
const roleHierarchy: Record<string, number> = {
  member: 1,
  admin: 2,
  owner: 3,
};

function hasRequiredRole(userRole: string, requiredRole: string): boolean {
  const userLevel = roleHierarchy[userRole] || 0;
  const requiredLevel = roleHierarchy[requiredRole] || 0;
  return userLevel >= requiredLevel;
}

export default async function DashboardViewerPage({ params }: { params: Params }) {
  const { id } = await params;
  const session = await getServerSession();

  // Verifica se há organização ativa
  if (!session?.session?.activeOrganizationId) {
    redirect("/");
  }

  // Busca o dashboard
  const dashboard = await db.dashboard.findUnique({
    where: { id },
  });

  if (!dashboard) {
    notFound();
  }

  // Verifica se o dashboard pertence à organização ativa
  if (dashboard.organizationId !== session.session.activeOrganizationId) {
    notFound();
  }

  // Verifica a role do usuário
  const member = await db.member.findFirst({
    where: {
      userId: session.user.id,
      organizationId: session.session.activeOrganizationId,
    },
  });

  const userRole = member?.role || "member";

  // Verifica se o usuário tem permissão para ver este dashboard
  if (!hasRequiredRole(userRole, dashboard.requiredRole)) {
    redirect("/");
  }

  return (
    <iframe
      className="w-dvw container-h"
      allowFullScreen
      title={dashboard.name}
      src={dashboard.iframeUrl}
    ></iframe>
  );
}
