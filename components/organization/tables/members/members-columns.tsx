"use client"

// bibliotecas, libs e funções:
import { startTransition, useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ColumnDef } from "@tanstack/react-table";
import { removeMember } from "@/auth/actions/members";

// tipos:
import { type User, type Member } from "@/prisma/client/client";

// componentes:
import { Button } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Spinner } from "@/components/ui/spinner"
import { toast } from "sonner";

// ícones:
import { ArrowUpDown } from "lucide-react";

// Definição das colunas da tabela de Usuários
export type MemberWithUser = Member & { user: User };

export const getMembersColumns = (organizationId: string): ColumnDef<MemberWithUser>[] => [
  {
    accessorKey: "user.email",
    id: "E-mail",
    header: ({ column }) => {
      // Cabeçalho customizado para permitir ordenação
      return (
        <div className="flex items-center gap-2">
          E-mail
          <Button
            variant="outline"
            className="size-7"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            <ArrowUpDown className="size-3.5" />
          </Button>
        </div>
      )
    },
  },
  {
    accessorKey: "user.name",
    id: "Nome",
    header: "Nome",
  },
  {
    accessorKey: "role",
    id: "Função",
    header: "Função",
  },
  {
    id: "Ações",
    header: "Ações",
    cell: ({ row }) => {
      // Célula de ações customizada
      return (
        <MemberActionsCell member={row.original} organizationId={organizationId} user={row.original.user} />
      )
    },
  },
]

function MemberActionsCell({ member, organizationId, user }: { member: MemberWithUser, organizationId: string, user: User }) {
  const [state, action, isPending] = useActionState(removeMember, null);
  const router = useRouter();
  const [open, setOpen] = useState(false);

  async function act() {
    startTransition(() => {
      action({ organizationId, memberId: member.id })
    })
  };

  // 2. O useEffect para monitorar a conclusão
  useEffect(() => {
    // Verifica se não está pendente E o estado indica sucesso
    if (!isPending && state?.success === true) {
      toast.success("Membro removido com sucesso.");
      setOpen(false);
      router.refresh();
    }
    // Opcional: Tratar erros
    if (!isPending && state?.success === false) {
      toast.error("Houve um erro ao remover o membro. Tente novamente.");
    }
  }, [isPending, state]); // Dependências: Roda sempre que isPending ou state mudar

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">Remover</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Remover membro</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-4 py-4">
          <p>
            Você está prestes a remover
          </p>

          <div className="grid grid-cols-2">
            <div>
              <p className="font-bold text-xl">{user.name}</p>
              <p className="text-muted-foreground">{user.email}</p>
            </div>


          </div>

          <p>Desta organização</p>
        </div>
        <DialogFooter className="">
          <DialogClose asChild>
            <Button variant="destructive">Cancelar</Button>
          </DialogClose>
          <DialogClose asChild>
            <Button onClick={() => act()}>
              {isPending ? <Spinner /> : "Remover"}
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
};