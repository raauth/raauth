export interface OrgChartPage {
  chartId: string;
  city: string;
  citySlug: string;
  sector: string;
  sectorSlug: string;
}

export interface OrgChartCityGroup {
  city: string;
  citySlug: string;
  sectors: OrgChartPage[];
}

export interface BuildOrgChartPathInput {
  organizationSlug: string;
  citySlug: string;
  sectorSlug: string;
}

export function normalizeOrgChartSegment(value: string) {
  const normalized = value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/&/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");

  return normalized || "geral";
}

export function buildOrgChartPath({
  organizationSlug,
  citySlug,
  sectorSlug,
}: BuildOrgChartPathInput) {
  return `/org/${encodeURIComponent(organizationSlug)}/organograma/${encodeURIComponent(citySlug)}/${encodeURIComponent(sectorSlug)}`;
}

export function groupOrgChartPagesByCity(
  pages: OrgChartPage[],
): OrgChartCityGroup[] {
  const grouped = new Map<string, OrgChartCityGroup>();

  for (const page of pages) {
    const group = grouped.get(page.citySlug);
    if (group) {
      group.sectors.push(page);
      continue;
    }

    grouped.set(page.citySlug, {
      city: page.city,
      citySlug: page.citySlug,
      sectors: [page],
    });
  }

  return [...grouped.values()]
    .map((group) => ({
      ...group,
      sectors: [...group.sectors].sort((a, b) =>
        a.sector.localeCompare(b.sector, "pt-BR"),
      ),
    }))
    .sort((a, b) => a.city.localeCompare(b.city, "pt-BR"));
}
