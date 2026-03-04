"use server";

import type { Edge, Node } from "@xyflow/react";

import { buildOrgChartPath, groupOrgChartPagesByCity, normalizeOrgChartSegment } from "@/lib/org-chart-navigation";
import { createOrgChartNodeData, normalizeOrgChartNodeData } from "@/lib/org-chart-node";
import { db } from "@/lib/db";
import type { Prisma } from "@/prisma/client/client";
import { getCurrentUser } from "@/server/actions/session";

const EDITOR_ROLES = new Set(["owner", "admin"]);

interface OrganizationMembershipContext {
  organizationId: string;
  organizationName: string;
  organizationSlug: string;
  currentUserId: string;
  role: string;
  canEdit: boolean;
}

interface CreateOrgChartPageInput {
  organizationSlug: string;
  city: string;
  sector: string;
}

interface CreateOrgChartCityInput {
  organizationSlug: string;
  city: string;
}

interface CreateOrgChartSectorInput {
  organizationSlug: string;
  citySlug: string;
  sector: string;
}

interface RenameOrgChartCityInput {
  organizationSlug: string;
  citySlug: string;
  city: string;
}

interface DeleteOrgChartCityInput {
  organizationSlug: string;
  citySlug: string;
}

interface RenameOrgChartSectorInput {
  organizationSlug: string;
  citySlug: string;
  sectorSlug: string;
  sector: string;
}

interface DeleteOrgChartSectorInput {
  organizationSlug: string;
  citySlug: string;
  sectorSlug: string;
}

interface SaveOrganizationChartLayoutInput {
  organizationSlug: string;
  chartId: string;
  nodes: Node[];
  edges: Edge[];
}

function isEditorRole(role: string) {
  return EDITOR_ROLES.has(role);
}

function toInputJson(value: unknown): Prisma.InputJsonValue {
  if (value === undefined) return {};

  try {
    return JSON.parse(JSON.stringify(value)) as Prisma.InputJsonValue;
  } catch {
    return {};
  }
}

function toSerializableNodeData(value: unknown) {
  return normalizeOrgChartNodeData(value);
}

function toSerializableEdgeData(value: unknown) {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return undefined;
  }

  const parsed = toInputJson(value);
  if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
    return undefined;
  }

  return parsed as Record<string, unknown>;
}

function createDefaultNodeLabel({
  organizationName,
  sector,
}: {
  organizationName: string;
  sector: string;
}) {
  return `${organizationName} - ${sector}`;
}

async function getOrganizationMembershipContext(
  organizationSlug: string,
): Promise<OrganizationMembershipContext | null> {
  const { currentUser } = await getCurrentUser();

  const organization = await db.organization.findFirst({
    where: {
      slug: organizationSlug,
      members: {
        some: {
          userId: currentUser.id,
        },
      },
    },
    select: {
      id: true,
      slug: true,
      name: true,
      members: {
        where: {
          userId: currentUser.id,
        },
        select: {
          role: true,
        },
        take: 1,
      },
    },
  });

  if (!organization) return null;

  const role = organization.members[0]?.role ?? "member";

  return {
    organizationId: organization.id,
    organizationName: organization.name,
    organizationSlug: organization.slug,
    currentUserId: currentUser.id,
    role,
    canEdit: isEditorRole(role),
  };
}

async function createChart({
  context,
  city,
  citySlug,
  sector,
  sectorSlug,
}: {
  context: OrganizationMembershipContext;
  city: string;
  citySlug: string;
  sector: string;
  sectorSlug: string;
}) {
  const rootNodeId = `root-${Date.now()}`;

  const chart = await db.organizationChart.create({
    data: {
      organizationId: context.organizationId,
      createdById: context.currentUserId,
      city,
      citySlug,
      sector,
      sectorSlug,
      nodes: {
        create: [
          {
            nodeId: rootNodeId,
            positionX: 0,
            positionY: 0,
            data: toInputJson(
              createOrgChartNodeData({
                label: createDefaultNodeLabel({
                  organizationName: context.organizationName,
                  sector,
                }),
                name: context.organizationName,
                role: sector,
              }),
            ),
          },
        ],
      },
    },
  });

  return chart;
}

async function getFirstAvailableOrgChartPath({
  organizationId,
  organizationSlug,
}: {
  organizationId: string;
  organizationSlug: string;
}) {
  const firstChart = await db.organizationChart.findFirst({
    where: {
      organizationId,
    },
    select: {
      citySlug: true,
      sectorSlug: true,
    },
    orderBy: [{ city: "asc" }, { sector: "asc" }],
  });

  if (!firstChart) {
    return `/org/${encodeURIComponent(organizationSlug)}/organograma`;
  }

  return buildOrgChartPath({
    organizationSlug,
    citySlug: firstChart.citySlug,
    sectorSlug: firstChart.sectorSlug,
  });
}

export async function getOrgChartSidebarData(organizationSlug: string) {
  const context = await getOrganizationMembershipContext(organizationSlug);
  if (!context) return null;

  let pages = await db.organizationChart.findMany({
    where: {
      organizationId: context.organizationId,
    },
    select: {
      id: true,
      city: true,
      citySlug: true,
      sector: true,
      sectorSlug: true,
    },
    orderBy: [{ city: "asc" }, { sector: "asc" }],
  });

  if (pages.length === 0 && context.canEdit) {
    const defaultCity = "Matriz";
    const defaultSector = "Geral";
    const defaultCitySlug = normalizeOrgChartSegment(defaultCity);
    const defaultSectorSlug = normalizeOrgChartSegment(defaultSector);

    const defaultChart = await db.organizationChart.upsert({
      where: {
        organizationId_citySlug_sectorSlug: {
          organizationId: context.organizationId,
          citySlug: defaultCitySlug,
          sectorSlug: defaultSectorSlug,
        },
      },
      update: {},
      create: {
        organizationId: context.organizationId,
        createdById: context.currentUserId,
        city: defaultCity,
        citySlug: defaultCitySlug,
        sector: defaultSector,
        sectorSlug: defaultSectorSlug,
        nodes: {
          create: [
            {
              nodeId: `root-${Date.now()}`,
              positionX: 0,
              positionY: 0,
              data: toInputJson(
                createOrgChartNodeData({
                  label: createDefaultNodeLabel({
                    organizationName: context.organizationName,
                    sector: defaultSector,
                  }),
                  name: context.organizationName,
                  role: defaultSector,
                }),
              ),
            },
          ],
        },
      },
      select: {
        id: true,
        city: true,
        citySlug: true,
        sector: true,
        sectorSlug: true,
      },
    });

    pages = [
      {
        id: defaultChart.id,
        city: defaultChart.city,
        citySlug: defaultChart.citySlug,
        sector: defaultChart.sector,
        sectorSlug: defaultChart.sectorSlug,
      },
    ];
  }

  const navigationPages = pages.map((page) => ({
    chartId: page.id,
    city: page.city,
    citySlug: page.citySlug,
    sector: page.sector,
    sectorSlug: page.sectorSlug,
  }));

  const groupedByCity = groupOrgChartPagesByCity(navigationPages);
  const firstPage = navigationPages[0];

  return {
    organization: {
      id: context.organizationId,
      name: context.organizationName,
      slug: context.organizationSlug,
    },
    canEdit: context.canEdit,
    role: context.role,
    groups: groupedByCity,
    defaultPath: firstPage
      ? buildOrgChartPath({
          organizationSlug: context.organizationSlug,
          citySlug: firstPage.citySlug,
          sectorSlug: firstPage.sectorSlug,
        })
      : null,
  };
}

export async function getOrgChartPageData({
  organizationSlug,
  citySlug,
  sectorSlug,
}: {
  organizationSlug: string;
  citySlug: string;
  sectorSlug: string;
}) {
  const context = await getOrganizationMembershipContext(organizationSlug);
  if (!context) return null;

  const chart = await db.organizationChart.findFirst({
    where: {
      organizationId: context.organizationId,
      citySlug,
      sectorSlug,
    },
    include: {
      nodes: {
        orderBy: { createdAt: "asc" },
      },
      edges: {
        orderBy: { createdAt: "asc" },
      },
    },
  });

  if (!chart) return null;

  const nodes: Node[] = chart.nodes.map((node) => ({
    id: node.nodeId,
    type: node.type ?? undefined,
    position: {
      x: node.positionX,
      y: node.positionY,
    },
    width: node.width ?? undefined,
    height: node.height ?? undefined,
    data: toSerializableNodeData(node.data),
  }));

  const edges: Edge[] = chart.edges.map((edge) => ({
    id: edge.edgeId,
    source: edge.source,
    target: edge.target,
    sourceHandle: edge.sourceHandle ?? undefined,
    targetHandle: edge.targetHandle ?? undefined,
    label: edge.label ?? undefined,
    type: edge.type ?? undefined,
    animated: edge.animated,
    data: toSerializableEdgeData(edge.data),
  }));

  return {
    organization: {
      id: context.organizationId,
      slug: context.organizationSlug,
      name: context.organizationName,
    },
    canEdit: context.canEdit,
    chart: {
      id: chart.id,
      city: chart.city,
      citySlug: chart.citySlug,
      sector: chart.sector,
      sectorSlug: chart.sectorSlug,
      path: buildOrgChartPath({
        organizationSlug: context.organizationSlug,
        citySlug: chart.citySlug,
        sectorSlug: chart.sectorSlug,
      }),
    },
    nodes,
    edges,
  };
}

export async function createOrgChartPage({
  organizationSlug,
  city,
  sector,
}: CreateOrgChartPageInput) {
  const context = await getOrganizationMembershipContext(organizationSlug);
  if (!context) {
    return { success: false as const, reason: "NOT_FOUND" as const };
  }

  if (!context.canEdit) {
    return { success: false as const, reason: "FORBIDDEN" as const };
  }

  const normalizedCity = city.trim() || "Matriz";
  const normalizedSector = sector.trim() || "Geral";
  const citySlug = normalizeOrgChartSegment(normalizedCity);
  const sectorSlug = normalizeOrgChartSegment(normalizedSector);

  const existing = await db.organizationChart.findUnique({
    where: {
      organizationId_citySlug_sectorSlug: {
        organizationId: context.organizationId,
        citySlug,
        sectorSlug,
      },
    },
    select: {
      id: true,
    },
  });

  const chart =
    existing ??
    (await createChart({
      context,
      city: normalizedCity,
      citySlug,
      sector: normalizedSector,
      sectorSlug,
    }));

  return {
    success: true as const,
    chartId: chart.id,
    path: buildOrgChartPath({
      organizationSlug: context.organizationSlug,
      citySlug,
      sectorSlug,
    }),
  };
}

export async function createOrgChartCity({
  organizationSlug,
  city,
}: CreateOrgChartCityInput) {
  const context = await getOrganizationMembershipContext(organizationSlug);
  if (!context) {
    return { success: false as const, reason: "NOT_FOUND" as const };
  }

  if (!context.canEdit) {
    return { success: false as const, reason: "FORBIDDEN" as const };
  }

  const normalizedCity = city.trim();
  if (!normalizedCity) {
    return { success: false as const, reason: "CITY_REQUIRED" as const };
  }

  const citySlug = normalizeOrgChartSegment(normalizedCity);
  const defaultSector = "Geral";
  const defaultSectorSlug = normalizeOrgChartSegment(defaultSector);

  const existingCity = await db.organizationChart.findFirst({
    where: {
      organizationId: context.organizationId,
      citySlug,
    },
    orderBy: {
      sector: "asc",
    },
    select: {
      id: true,
      citySlug: true,
      sectorSlug: true,
    },
  });

  if (existingCity) {
    return {
      success: true as const,
      chartId: existingCity.id,
      path: buildOrgChartPath({
        organizationSlug: context.organizationSlug,
        citySlug: existingCity.citySlug,
        sectorSlug: existingCity.sectorSlug,
      }),
      alreadyExists: true as const,
    };
  }

  const chart = await createChart({
    context,
    city: normalizedCity,
    citySlug,
    sector: defaultSector,
    sectorSlug: defaultSectorSlug,
  });

  return {
    success: true as const,
    chartId: chart.id,
    path: buildOrgChartPath({
      organizationSlug: context.organizationSlug,
      citySlug,
      sectorSlug: defaultSectorSlug,
    }),
    alreadyExists: false as const,
  };
}

export async function createOrgChartSector({
  organizationSlug,
  citySlug,
  sector,
}: CreateOrgChartSectorInput) {
  const context = await getOrganizationMembershipContext(organizationSlug);
  if (!context) {
    return { success: false as const, reason: "NOT_FOUND" as const };
  }

  if (!context.canEdit) {
    return { success: false as const, reason: "FORBIDDEN" as const };
  }

  const normalizedSector = sector.trim();
  if (!normalizedSector) {
    return { success: false as const, reason: "SECTOR_REQUIRED" as const };
  }

  const cityRecord = await db.organizationChart.findFirst({
    where: {
      organizationId: context.organizationId,
      citySlug,
    },
    orderBy: {
      sector: "asc",
    },
    select: {
      city: true,
      citySlug: true,
    },
  });

  if (!cityRecord) {
    return { success: false as const, reason: "CITY_NOT_FOUND" as const };
  }

  const sectorSlug = normalizeOrgChartSegment(normalizedSector);

  const existingChart = await db.organizationChart.findUnique({
    where: {
      organizationId_citySlug_sectorSlug: {
        organizationId: context.organizationId,
        citySlug: cityRecord.citySlug,
        sectorSlug,
      },
    },
    select: {
      id: true,
      citySlug: true,
      sectorSlug: true,
    },
  });

  if (existingChart) {
    return {
      success: true as const,
      chartId: existingChart.id,
      path: buildOrgChartPath({
        organizationSlug: context.organizationSlug,
        citySlug: existingChart.citySlug,
        sectorSlug: existingChart.sectorSlug,
      }),
      alreadyExists: true as const,
    };
  }

  const chart = await createChart({
    context,
    city: cityRecord.city,
    citySlug: cityRecord.citySlug,
    sector: normalizedSector,
    sectorSlug,
  });

  return {
    success: true as const,
    chartId: chart.id,
    path: buildOrgChartPath({
      organizationSlug: context.organizationSlug,
      citySlug: cityRecord.citySlug,
      sectorSlug,
    }),
    alreadyExists: false as const,
  };
}

export async function renameOrgChartCity({
  organizationSlug,
  citySlug,
  city,
}: RenameOrgChartCityInput) {
  const context = await getOrganizationMembershipContext(organizationSlug);
  if (!context) {
    return { success: false as const, reason: "NOT_FOUND" as const };
  }

  if (!context.canEdit) {
    return { success: false as const, reason: "FORBIDDEN" as const };
  }

  const normalizedCity = city.trim();
  if (!normalizedCity) {
    return { success: false as const, reason: "CITY_REQUIRED" as const };
  }

  const chartsInCity = await db.organizationChart.findMany({
    where: {
      organizationId: context.organizationId,
      citySlug,
    },
    select: {
      id: true,
      sectorSlug: true,
    },
    orderBy: {
      sector: "asc",
    },
  });

  if (chartsInCity.length === 0) {
    return { success: false as const, reason: "CITY_NOT_FOUND" as const };
  }

  const nextCitySlug = normalizeOrgChartSegment(normalizedCity);

  if (nextCitySlug !== citySlug) {
    const conflictingSectors = chartsInCity.map((chart) => chart.sectorSlug);
    const conflict = await db.organizationChart.findFirst({
      where: {
        organizationId: context.organizationId,
        citySlug: nextCitySlug,
        sectorSlug: {
          in: conflictingSectors,
        },
      },
      select: {
        id: true,
      },
    });

    if (conflict) {
      return { success: false as const, reason: "CITY_CONFLICT" as const };
    }
  }

  await db.organizationChart.updateMany({
    where: {
      organizationId: context.organizationId,
      citySlug,
    },
    data: {
      city: normalizedCity,
      citySlug: nextCitySlug,
    },
  });

  const firstSectorSlug = chartsInCity[0]?.sectorSlug ?? "geral";

  return {
    success: true as const,
    city: normalizedCity,
    citySlug: nextCitySlug,
    path: buildOrgChartPath({
      organizationSlug: context.organizationSlug,
      citySlug: nextCitySlug,
      sectorSlug: firstSectorSlug,
    }),
  };
}

export async function deleteOrgChartCity({
  organizationSlug,
  citySlug,
}: DeleteOrgChartCityInput) {
  const context = await getOrganizationMembershipContext(organizationSlug);
  if (!context) {
    return { success: false as const, reason: "NOT_FOUND" as const };
  }

  if (!context.canEdit) {
    return { success: false as const, reason: "FORBIDDEN" as const };
  }

  const existingCityCharts = await db.organizationChart.findMany({
    where: {
      organizationId: context.organizationId,
      citySlug,
    },
    select: {
      id: true,
    },
  });

  if (existingCityCharts.length === 0) {
    return { success: false as const, reason: "CITY_NOT_FOUND" as const };
  }

  await db.organizationChart.deleteMany({
    where: {
      organizationId: context.organizationId,
      citySlug,
    },
  });

  const nextPath = await getFirstAvailableOrgChartPath({
    organizationId: context.organizationId,
    organizationSlug: context.organizationSlug,
  });

  return {
    success: true as const,
    deletedCount: existingCityCharts.length,
    path: nextPath,
  };
}

export async function renameOrgChartSector({
  organizationSlug,
  citySlug,
  sectorSlug,
  sector,
}: RenameOrgChartSectorInput) {
  const context = await getOrganizationMembershipContext(organizationSlug);
  if (!context) {
    return { success: false as const, reason: "NOT_FOUND" as const };
  }

  if (!context.canEdit) {
    return { success: false as const, reason: "FORBIDDEN" as const };
  }

  const normalizedSector = sector.trim();
  if (!normalizedSector) {
    return { success: false as const, reason: "SECTOR_REQUIRED" as const };
  }

  const existingChart = await db.organizationChart.findUnique({
    where: {
      organizationId_citySlug_sectorSlug: {
        organizationId: context.organizationId,
        citySlug,
        sectorSlug,
      },
    },
    select: {
      id: true,
      citySlug: true,
    },
  });

  if (!existingChart) {
    return { success: false as const, reason: "SECTOR_NOT_FOUND" as const };
  }

  const nextSectorSlug = normalizeOrgChartSegment(normalizedSector);

  if (nextSectorSlug !== sectorSlug) {
    const conflict = await db.organizationChart.findUnique({
      where: {
        organizationId_citySlug_sectorSlug: {
          organizationId: context.organizationId,
          citySlug: existingChart.citySlug,
          sectorSlug: nextSectorSlug,
        },
      },
      select: {
        id: true,
      },
    });

    if (conflict) {
      return { success: false as const, reason: "SECTOR_CONFLICT" as const };
    }
  }

  await db.organizationChart.update({
    where: {
      id: existingChart.id,
    },
    data: {
      sector: normalizedSector,
      sectorSlug: nextSectorSlug,
    },
  });

  return {
    success: true as const,
    sector: normalizedSector,
    sectorSlug: nextSectorSlug,
    path: buildOrgChartPath({
      organizationSlug: context.organizationSlug,
      citySlug: existingChart.citySlug,
      sectorSlug: nextSectorSlug,
    }),
  };
}

export async function deleteOrgChartSector({
  organizationSlug,
  citySlug,
  sectorSlug,
}: DeleteOrgChartSectorInput) {
  const context = await getOrganizationMembershipContext(organizationSlug);
  if (!context) {
    return { success: false as const, reason: "NOT_FOUND" as const };
  }

  if (!context.canEdit) {
    return { success: false as const, reason: "FORBIDDEN" as const };
  }

  const existingChart = await db.organizationChart.findUnique({
    where: {
      organizationId_citySlug_sectorSlug: {
        organizationId: context.organizationId,
        citySlug,
        sectorSlug,
      },
    },
    select: {
      id: true,
      citySlug: true,
    },
  });

  if (!existingChart) {
    return { success: false as const, reason: "SECTOR_NOT_FOUND" as const };
  }

  await db.organizationChart.delete({
    where: {
      id: existingChart.id,
    },
  });

  const nextChartInCity = await db.organizationChart.findFirst({
    where: {
      organizationId: context.organizationId,
      citySlug: existingChart.citySlug,
    },
    select: {
      citySlug: true,
      sectorSlug: true,
    },
    orderBy: {
      sector: "asc",
    },
  });

  if (nextChartInCity) {
    return {
      success: true as const,
      path: buildOrgChartPath({
        organizationSlug: context.organizationSlug,
        citySlug: nextChartInCity.citySlug,
        sectorSlug: nextChartInCity.sectorSlug,
      }),
    };
  }

  const nextPath = await getFirstAvailableOrgChartPath({
    organizationId: context.organizationId,
    organizationSlug: context.organizationSlug,
  });

  return {
    success: true as const,
    path: nextPath,
  };
}

export async function saveOrganizationChartLayout({
  organizationSlug,
  chartId,
  nodes,
  edges,
}: SaveOrganizationChartLayoutInput) {
  const context = await getOrganizationMembershipContext(organizationSlug);
  if (!context) {
    return { success: false as const, reason: "NOT_FOUND" as const };
  }

  if (!context.canEdit) {
    return { success: false as const, reason: "FORBIDDEN" as const };
  }

  const chart = await db.organizationChart.findFirst({
    where: {
      id: chartId,
      organizationId: context.organizationId,
    },
    select: {
      id: true,
    },
  });

  if (!chart) {
    return { success: false as const, reason: "CHART_NOT_FOUND" as const };
  }

  const parsedNodes = nodes
    .filter((node) => typeof node.id === "string" && node.id.length > 0)
    .map((node) => ({
      chartId,
      nodeId: node.id,
      type: node.type ?? null,
      positionX:
        typeof node.position?.x === "number" && Number.isFinite(node.position.x)
          ? node.position.x
          : 0,
      positionY:
        typeof node.position?.y === "number" && Number.isFinite(node.position.y)
          ? node.position.y
          : 0,
      width:
        typeof node.width === "number" && Number.isFinite(node.width)
          ? node.width
          : null,
      height:
        typeof node.height === "number" && Number.isFinite(node.height)
          ? node.height
          : null,
      data: toInputJson(toSerializableNodeData(node.data)),
    }));

  if (parsedNodes.length === 0) {
    return { success: false as const, reason: "EMPTY_CHART" as const };
  }

  const parsedEdges = edges
    .filter((edge) => typeof edge.id === "string" && edge.id.length > 0)
    .map((edge) => {
      const edgeData = toSerializableEdgeData(edge.data);

      return {
        chartId,
        edgeId: edge.id,
        source: edge.source,
        target: edge.target,
        sourceHandle: edge.sourceHandle ?? null,
        targetHandle: edge.targetHandle ?? null,
        type: edge.type ?? null,
        label: typeof edge.label === "string" ? edge.label : null,
        animated: Boolean(edge.animated),
        data: edgeData ? toInputJson(edgeData) : undefined,
      };
    });

  await db.$transaction(async (tx) => {
    await tx.organizationChartNode.deleteMany({
      where: {
        chartId,
      },
    });

    await tx.organizationChartEdge.deleteMany({
      where: {
        chartId,
      },
    });

    await tx.organizationChartNode.createMany({
      data: parsedNodes,
    });

    if (parsedEdges.length > 0) {
      await tx.organizationChartEdge.createMany({
        data: parsedEdges,
      });
    }

    await tx.organizationChart.update({
      where: {
        id: chartId,
      },
      data: {
        updatedAt: new Date(),
      },
    });
  });

  return { success: true as const };
}
