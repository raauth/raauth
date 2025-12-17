import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect, notFound } from "next/navigation";

export default async function OrgLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { orgSlug: string };
}) {
  const h = await headers();

  // há sessão?
  const session = await auth.api.getSession({ headers: h });
  if (!session) redirect("/entrar");

  // é membro dessa org?
  const orgs = await auth.api.listOrganizations({
    headers: h, // precisa dos cookies da sessão
  }); // lista só as orgs do usuário :contentReference[oaicite:0]{index=0}

  const org = orgs?.find((o) => o.slug === params.orgSlug);
  if (!org) notFound(); // ou redirect("/no-access")

  return <>{children}</>;
}
