"use server";

import { db } from "@/lib/db";
import { getServerSession } from "@/auth/actions/session";

// Tipos
export interface Dashboard {
  id: string;
  name: string;
  iframeUrl: string;
  description: string | null;
  requiredRole: string;
  organizationId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateDashboardData {
  name: string;
  iframeUrl: string;
  description?: string;
  requiredRole: string;
  organizationId: string;
}

export interface UpdateDashboardData {
  name?: string;
  iframeUrl?: string;
  description?: string;
  requiredRole?: string;
}

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

// Busca dashboards por organização, filtrados pela role do usuário
export async function getDashboardsByOrganization(
  organizationId: string,
  userRole: string
): Promise<Dashboard[]> {
  const dashboards = await db.dashboard.findMany({
    where: {
      organizationId,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  // Filtra dashboards baseado na role do usuário
  return dashboards.filter((dashboard) =>
    hasRequiredRole(userRole, dashboard.requiredRole)
  );
}

// Busca todos os dashboards da organização (para admin)
export async function getAllDashboardsByOrganization(
  organizationId: string
): Promise<Dashboard[]> {
  return db.dashboard.findMany({
    where: {
      organizationId,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
}

// Cria novo dashboard (apenas admin/owner)
export async function createDashboard(
  data: CreateDashboardData
): Promise<Dashboard | null> {
  const session = await getServerSession();

  if (!session?.session?.activeOrganizationId) {
    throw new Error("Nenhuma organização ativa");
  }

  // Verifica se user tem permissão (admin ou owner)
  const member = await db.member.findFirst({
    where: {
      userId: session.user.id,
      organizationId: data.organizationId,
    },
  });

  if (!member || !hasRequiredRole(member.role, "admin")) {
    throw new Error("Você não tem permissão para criar dashboards");
  }

  return db.dashboard.create({
    data: {
      name: data.name,
      iframeUrl: data.iframeUrl,
      description: data.description || null,
      requiredRole: data.requiredRole,
      organizationId: data.organizationId,
    },
  });
}

// Atualiza dashboard existente
export async function updateDashboard(
  id: string,
  data: UpdateDashboardData
): Promise<Dashboard | null> {
  const session = await getServerSession();

  if (!session?.session?.activeOrganizationId) {
    throw new Error("Nenhuma organização ativa");
  }

  const dashboard = await db.dashboard.findUnique({
    where: { id },
  });

  if (!dashboard) {
    throw new Error("Dashboard não encontrado");
  }

  // Verifica permissão
  const member = await db.member.findFirst({
    where: {
      userId: session.user.id,
      organizationId: dashboard.organizationId,
    },
  });

  if (!member || !hasRequiredRole(member.role, "admin")) {
    throw new Error("Você não tem permissão para editar dashboards");
  }

  return db.dashboard.update({
    where: { id },
    data,
  });
}

// Deleta dashboard
export async function deleteDashboard(id: string): Promise<boolean> {
  const session = await getServerSession();

  if (!session?.session?.activeOrganizationId) {
    throw new Error("Nenhuma organização ativa");
  }

  const dashboard = await db.dashboard.findUnique({
    where: { id },
  });

  if (!dashboard) {
    throw new Error("Dashboard não encontrado");
  }

  // Verifica permissão
  const member = await db.member.findFirst({
    where: {
      userId: session.user.id,
      organizationId: dashboard.organizationId,
    },
  });

  if (!member || !hasRequiredRole(member.role, "admin")) {
    throw new Error("Você não tem permissão para excluir dashboards");
  }

  await db.dashboard.delete({
    where: { id },
  });

  return true;
}
