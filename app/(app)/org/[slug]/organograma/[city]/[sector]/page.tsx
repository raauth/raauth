import { notFound } from "next/navigation";

import { OrgChartEditor } from "@/components/organization/org-chart-editor";
import { getOrgChartPageData } from "@/server/actions/org-chart";

type Params = Promise<{
  slug: string;
  city: string;
  sector: string;
}>;

export default async function OrganizationChartPage({
  params,
}: {
  params: Params;
}) {
  const { slug, city, sector } = await params;
  const pageData = await getOrgChartPageData({
    organizationSlug: slug,
    citySlug: city,
    sectorSlug: sector,
  });

  if (!pageData) {
    notFound();
  }

  return (
    <div className="flex h-full min-h-0 w-full flex-1 flex-col gap-3 rounded-xl border bg-card p-3">
      <OrgChartEditor
        organizationSlug={pageData.organization.slug}
        chartId={pageData.chart.id}
        canEdit={pageData.canEdit}
        initialNodes={pageData.nodes}
        initialEdges={pageData.edges}
      />
    </div>
  );
}
