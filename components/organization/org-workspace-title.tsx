"use client";

import { useMemo } from "react";
import { usePathname } from "next/navigation";

import { OrgChartTitle } from "@/components/organization/org-chart-title";
import type { OrgChartCityGroup } from "@/lib/org-chart-navigation";

interface OrgWorkspaceTitleProps {
  organizationSlug: string;
  groups: OrgChartCityGroup[];
  fallbackTitle: string;
}

function findChartFromPath(
  pathname: string,
  organizationSlug: string,
  groups: OrgChartCityGroup[],
) {
  const segments = pathname.split("/").filter(Boolean);

  if (segments.length < 5) {
    return null;
  }

  const [orgSegment, slugSegment, areaSegment, citySegment, sectorSegment] = segments;

  if (
    orgSegment !== "org" ||
    decodeURIComponent(slugSegment) !== organizationSlug ||
    areaSegment !== "organograma"
  ) {
    return null;
  }

  const citySlug = decodeURIComponent(citySegment);
  const sectorSlug = decodeURIComponent(sectorSegment);
  const cityGroup = groups.find((group) => group.citySlug === citySlug);
  const sector = cityGroup?.sectors.find((item) => item.sectorSlug === sectorSlug);

  if (!cityGroup || !sector) {
    return null;
  }

  return {
    city: cityGroup.city,
    sector: sector.sector,
  };
}

export function OrgWorkspaceTitle({
  organizationSlug,
  groups,
  fallbackTitle,
}: OrgWorkspaceTitleProps) {
  const pathname = usePathname();

  const chart = useMemo(
    () => findChartFromPath(pathname, organizationSlug, groups),
    [pathname, organizationSlug, groups],
  );

  if (!chart) {
    return <p className="pt-1 text-sm text-muted-foreground">{fallbackTitle}</p>;
  }

  return <OrgChartTitle city={chart.city} sector={chart.sector} compact />;
}
