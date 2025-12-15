"use client"

// componentes:
import { Card } from "@/components/ui/card";
import { MembersDataTable } from "@/components/organization/tables/members/data-table";
import { membersColumns } from "./members-columns";

// tipos:
import { type Member } from "@/prisma/client/client";

export function AllMembers({ members }: { members: Member[] }) {
  // O componente AllUsers agora é responsável apenas por 
  // fornecer os dados e as colunas para o DataTable genérico.
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <h3 className="scroll-m-20 text-2xl font-semibold tracking-tight">Membros</h3>
        <p className="text-muted-foreground text-sm">Usuários que fazem parte desta organização</p>
      </div>
      <Card className="p-4 sm:max-w-full lg:max-w-3/4 2xl:max-w-2/4">
        {/* Renderiza a tabela de dados usando as colunas definidas e lista de usuários */}
        <MembersDataTable columns={membersColumns} data={members} />
      </Card>
    </div>
  );
}