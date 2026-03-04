#!/usr/bin/env node

require("dotenv").config();

const fs = require("node:fs");
const path = require("node:path");
const { createHash } = require("node:crypto");
const { Client } = require("pg");

const DEFAULT_BACKUP_FILE = "backup para raave.json";
const DEFAULT_NODE_ACCENT_COLOR = "#3b82f6";
const ORG_CHART_NODE_TYPE = "orgPersonNode";

function normalizeOrgChartSegment(value) {
  const normalized = String(value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/&/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");

  return normalized || "geral";
}

function sanitizeText(value, fallback = "") {
  if (typeof value !== "string") return fallback;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : fallback;
}

function sanitizeNumber(value, fallback = 0) {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

function sanitizeColor(value) {
  return /^#(?:[0-9A-Fa-f]{6})$/.test(String(value ?? "").trim())
    ? String(value).trim()
    : DEFAULT_NODE_ACCENT_COLOR;
}

function createStableId(prefix, ...parts) {
  const hash = createHash("sha1")
    .update(parts.map((part) => String(part ?? "")).join("::"))
    .digest("hex")
    .slice(0, 24);

  return `${prefix}_${hash}`;
}

function splitRootName(value) {
  const normalized = sanitizeText(value, "Matriz");
  const parts = normalized.split(/\s+-\s+/).map((part) => part.trim()).filter(Boolean);

  if (parts.length >= 2) {
    return {
      sector: parts[0],
      city: parts[parts.length - 1],
    };
  }

  return {
    sector: normalized,
    city: "Matriz",
  };
}

function parseArgs(argv) {
  const options = {
    backupPath: DEFAULT_BACKUP_FILE,
    orgSlug: "",
    dryRun: false,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const current = argv[index];

    if (current === "--") {
      continue;
    }

    if (current === "--backup" && argv[index + 1]) {
      options.backupPath = argv[index + 1];
      index += 1;
      continue;
    }

    if (current === "--org-slug" && argv[index + 1]) {
      options.orgSlug = argv[index + 1];
      index += 1;
      continue;
    }

    if (current === "--dry-run") {
      options.dryRun = true;
      continue;
    }

    throw new Error(
      `Parametro invalido: ${current}\nUso: node scripts/import-org-chart-backup.js [--backup "<arquivo>"] [--org-slug "<slug>"] [--dry-run]`,
    );
  }

  return options;
}

function loadBackup(backupPath) {
  const absolutePath = path.resolve(process.cwd(), backupPath);
  const content = fs.readFileSync(absolutePath, "utf8");
  const parsed = JSON.parse(content);

  if (!Array.isArray(parsed) || parsed.length === 0) {
    throw new Error("O arquivo de backup nao possui uma lista valida de organogramas.");
  }

  return {
    absolutePath,
    charts: parsed,
  };
}

function mapBackupCharts(charts) {
  const rootChart = charts.find((chart) => chart && chart.parentId == null) ?? charts[0];
  const rootName = sanitizeText(rootChart?.name, "Matriz");
  const { city: inferredCity, sector: rootSector } = splitRootName(rootName);

  return charts.map((chart) => {
    const chartId = sanitizeText(chart?.id, `legacy-${Math.random().toString(36).slice(2, 10)}`);
    const chartName = sanitizeText(chart?.name, chartId);
    const sector = chartId === sanitizeText(rootChart?.id, "") ? rootSector : chartName;
    const city = inferredCity;
    const accentColor = sanitizeColor(chart?.themeColor);
    const nodesSource = Array.isArray(chart?.nodes) ? chart.nodes : [];
    const edgesSource = Array.isArray(chart?.edges) ? chart.edges : [];
    const nodeIds = new Set();

    const nodes = nodesSource.map((node, nodeIndex) => {
      const nodeId = sanitizeText(node?.id, `legacy-node-${chartId}-${nodeIndex}`);
      const role = sanitizeText(node?.role, "Cargo");
      const explicitName = sanitizeText(node?.name, "");
      const name = explicitName || role || "Sem nome";
      const label = name;

      nodeIds.add(nodeId);

      return {
        nodeId,
        type: ORG_CHART_NODE_TYPE,
        positionX: sanitizeNumber(node?.x, 0),
        positionY: sanitizeNumber(node?.y, 0),
        width: null,
        height: null,
        data: {
          label,
          name,
          role,
          avatarUrl: null,
          accentColor,
        },
      };
    });

    const edges = edgesSource
      .map((edge, edgeIndex) => {
        const edgeId = sanitizeText(edge?.id, `legacy-edge-${chartId}-${edgeIndex}`);
        const source = sanitizeText(edge?.source, "");
        const target = sanitizeText(edge?.target, "");

        if (!source || !target || !nodeIds.has(source) || !nodeIds.has(target)) {
          return null;
        }

        return {
          edgeId,
          source,
          target,
          sourceHandle: null,
          targetHandle: null,
          type: null,
          label: null,
          animated: false,
          data: null,
        };
      })
      .filter(Boolean);

    return {
      legacyId: chartId,
      legacyName: chartName,
      city,
      citySlug: normalizeOrgChartSegment(city),
      sector,
      sectorSlug: normalizeOrgChartSegment(sector),
      accentColor,
      nodes,
      edges,
    };
  });
}

async function resolveOrganization(client, slug) {
  if (slug) {
    const bySlug = await client.query(
      `select id, name, slug from organization where slug = $1 limit 1`,
      [slug],
    );

    if (bySlug.rowCount === 0) {
      throw new Error(`Organizacao com slug "${slug}" nao foi encontrada.`);
    }

    return bySlug.rows[0];
  }

  const first = await client.query(
    `select id, name, slug from organization order by "createdAt" asc limit 1`,
  );

  if (first.rowCount === 0) {
    throw new Error("Nenhuma organizacao encontrada no banco.");
  }

  return first.rows[0];
}

async function resolveCreatorUser(client, organizationId) {
  const owner = await client.query(
    `
      select m."userId"
      from member m
      where m."organizationId" = $1 and m.role = 'owner'
      order by m."createdAt" asc
      limit 1
    `,
    [organizationId],
  );

  if (owner.rowCount > 0) {
    return owner.rows[0].userId;
  }

  const anyMember = await client.query(
    `
      select m."userId"
      from member m
      where m."organizationId" = $1
      order by m."createdAt" asc
      limit 1
    `,
    [organizationId],
  );

  if (anyMember.rowCount > 0) {
    return anyMember.rows[0].userId;
  }

  const anyUser = await client.query(
    `select id from "user" order by "createdAt" asc limit 1`,
  );

  if (anyUser.rowCount > 0) {
    return anyUser.rows[0].id;
  }

  throw new Error("Nao foi possivel definir createdById: nao existe usuario no banco.");
}

async function upsertChart(client, input) {
  const chartStableId = createStableId(
    "chart",
    input.organizationId,
    input.citySlug,
    input.sectorSlug,
  );

  const upsertChartResult = await client.query(
    `
      insert into organization_chart (
        id,
        "organizationId",
        "createdById",
        city,
        "citySlug",
        sector,
        "sectorSlug",
        "createdAt",
        "updatedAt"
      )
      values ($1, $2, $3, $4, $5, $6, $7, now(), now())
      on conflict ("organizationId", "citySlug", "sectorSlug")
      do update set
        city = excluded.city,
        sector = excluded.sector,
        "updatedAt" = now()
      returning id
    `,
    [
      chartStableId,
      input.organizationId,
      input.createdById,
      input.city,
      input.citySlug,
      input.sector,
      input.sectorSlug,
    ],
  );

  const chartId = upsertChartResult.rows[0].id;

  await client.query(
    `delete from organization_chart_edge where "chartId" = $1`,
    [chartId],
  );
  await client.query(
    `delete from organization_chart_node where "chartId" = $1`,
    [chartId],
  );

  for (const node of input.nodes) {
    await client.query(
      `
        insert into organization_chart_node (
          id,
          "chartId",
          "nodeId",
          type,
          "positionX",
          "positionY",
          data,
          width,
          height,
          "createdAt",
          "updatedAt"
        )
        values ($1, $2, $3, $4, $5, $6, $7::jsonb, $8, $9, now(), now())
      `,
      [
        createStableId("node", chartId, node.nodeId),
        chartId,
        node.nodeId,
        node.type,
        node.positionX,
        node.positionY,
        JSON.stringify(node.data),
        node.width,
        node.height,
      ],
    );
  }

  for (const edge of input.edges) {
    await client.query(
      `
        insert into organization_chart_edge (
          id,
          "chartId",
          "edgeId",
          source,
          target,
          "sourceHandle",
          "targetHandle",
          type,
          label,
          animated,
          data,
          "createdAt",
          "updatedAt"
        )
        values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11::jsonb, now(), now())
      `,
      [
        createStableId("edge", chartId, edge.edgeId, edge.source, edge.target),
        chartId,
        edge.edgeId,
        edge.source,
        edge.target,
        edge.sourceHandle,
        edge.targetHandle,
        edge.type,
        edge.label,
        edge.animated,
        edge.data ? JSON.stringify(edge.data) : null,
      ],
    );
  }

  return {
    chartId,
    city: input.city,
    sector: input.sector,
    nodes: input.nodes.length,
    edges: input.edges.length,
    legacyId: input.legacyId,
    legacyName: input.legacyName,
  };
}

async function fetchImportedSummary(client, organizationId) {
  const summary = await client.query(
    `
      select
        count(*)::int as "chartCount",
        coalesce(sum(node_counts.count), 0)::int as "nodeCount",
        coalesce(sum(edge_counts.count), 0)::int as "edgeCount"
      from organization_chart c
      left join lateral (
        select count(*)::int as count
        from organization_chart_node n
        where n."chartId" = c.id
      ) node_counts on true
      left join lateral (
        select count(*)::int as count
        from organization_chart_edge e
        where e."chartId" = c.id
      ) edge_counts on true
      where c."organizationId" = $1
    `,
    [organizationId],
  );

  return summary.rows[0];
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  const loaded = loadBackup(options.backupPath);
  const mappedCharts = mapBackupCharts(loaded.charts);

  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL nao encontrado no ambiente.");
  }

  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });

  await client.connect();

  try {
    const organization = await resolveOrganization(client, options.orgSlug);
    const createdById = await resolveCreatorUser(client, organization.id);
    const totalNodes = mappedCharts.reduce((acc, chart) => acc + chart.nodes.length, 0);
    const totalEdges = mappedCharts.reduce((acc, chart) => acc + chart.edges.length, 0);

    console.log(`Backup: ${path.basename(loaded.absolutePath)}`);
    console.log(`Organizacao alvo: ${organization.slug} (${organization.id})`);
    console.log(`Usuario criador (createdById): ${createdById}`);
    console.log(
      `Importacao planejada: ${mappedCharts.length} paginas, ${totalNodes} nos, ${totalEdges} arestas`,
    );

    if (options.dryRun) {
      console.log("\nModo dry-run ativo. Nenhuma alteracao foi gravada.");
      return;
    }

    await client.query("begin");

    const results = [];
    for (const chart of mappedCharts) {
      const result = await upsertChart(client, {
        ...chart,
        organizationId: organization.id,
        createdById,
      });
      results.push(result);
    }

    await client.query("commit");

    console.log("\nPaginas importadas:");
    for (const item of results) {
      console.log(
        `- ${item.city} / ${item.sector} | chartId=${item.chartId} | nos=${item.nodes} | arestas=${item.edges} | origem=${item.legacyId} (${item.legacyName})`,
      );
    }

    const summary = await fetchImportedSummary(client, organization.id);

    console.log("\nResumo atual da organizacao:");
    console.log(
      `- paginas: ${summary.chartCount}\n- nos: ${summary.nodeCount}\n- arestas: ${summary.edgeCount}`,
    );
  } catch (error) {
    try {
      await client.query("rollback");
    } catch {
      // noop
    }
    throw error;
  } finally {
    await client.end();
  }
}

main().catch((error) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`Erro ao importar backup: ${message}`);
  process.exit(1);
});
