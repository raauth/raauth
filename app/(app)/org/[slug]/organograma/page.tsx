import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getOrgChartSidebarData } from "@/server/actions/org-chart";

type Params = Promise<{ slug: string }>;

export default async function OrganizationChartIndexPage({
  params,
}: {
  params: Params;
}) {
  const { slug } = await params;
  const sidebarData = await getOrgChartSidebarData(slug);

  if (!sidebarData) {
    notFound();
  }

  if (sidebarData.defaultPath) {
    redirect(sidebarData.defaultPath);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Nenhum organograma disponivel</CardTitle>
        <CardDescription>
          Esta organizacao ainda nao possui paginas de organograma para seu perfil.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button asChild variant="outline">
          <Link href={`/org/${slug}`}>Voltar para gerenciamento</Link>
        </Button>
      </CardContent>
    </Card>
  );
}
