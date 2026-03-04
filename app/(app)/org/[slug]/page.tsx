// ============================================================
// 🏢 PÁGINA DA ORGANIZAÇÃO (/org/[slug])
// ============================================================
// Página de detalhes e gerenciamento de uma organização.
// Mostra:
// - Lista de membros da organização
// - Lista de usuários que podem ser adicionados
// - Informações gerais da organização
//
// 📌 ROTA DINÂMICA:
// O [slug] na URL é capturado via params.
// Ex: /org/minha-empresa → slug = "minha-empresa"
//
// 💡 PONTO DE EXTENSÃO: adicione mais seções ou cards
// com informações específicas da sua aplicação.
// ============================================================

// Server actions para buscar dados
import { getOrganizationBySlug } from "@/server/actions/organizations";
import { getAllUsers } from "@/server/actions/users";
import Link from "next/link";
import { notFound } from "next/navigation";

// Componentes de exibição
import { InfosCard } from "@/components/organization/infos-card";
import { AllMembers } from "@/components/organization/tables/members/all-members";
import { AllUsers } from "@/components/organization/tables/users/all-users";
import { Button } from "@/components/ui/button";

// Tipo para os params da rota dinâmica
// No Next.js 15+, params é uma Promise
type Params = Promise<{ slug: string }>;

export default async function OrganizationPage({ params }: { params: Params }) {
  // Await nos params (obrigatório no Next.js 15+)
  const { slug } = await params;

  // Busca a organização pelo slug (inclui membros e seus dados)
  const organization = await getOrganizationBySlug(slug);
  if (!organization) {
    notFound();
  }

  // Busca usuários que NÃO são membros (para poder adicioná-los)
  const users = await getAllUsers(organization.id);

  return (
    <div className="flex flex-col lg:grid lg:grid-cols-5 gap-8">
      <div className="col-span-5 flex items-center justify-between rounded-lg border bg-card p-4">
        <p className="text-sm text-muted-foreground">
          Esta area e dedicada ao gerenciamento de membros e configuracoes da organizacao.
        </p>
        <Button asChild size="sm">
          <Link href={`/org/${organization.slug}/organograma`}>
            Ir para organogramas
          </Link>
        </Button>
      </div>
      {/* Coluna principal (3/5 da largura): tabelas */}
      <div className="flex flex-col gap-4 col-span-3">
        {/* Tabela de membros da organização */}
        <AllMembers members={organization.members || []} />
        {/* Tabela de usuários disponíveis para adicionar */}
        <AllUsers users={users || []} />
      </div>

      {/* Coluna lateral (2/5 da largura): info card */}
      <div className="flex flex-col gap-4 col-span-2">
        <InfosCard organization={organization} />
      </div>
    </div>
  );
}
