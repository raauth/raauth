"use client"

// bibliotecas, libs e funções:
import { startTransition, useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { addMember } from "@/auth/actions/members";
import { ColumnDef } from "@tanstack/react-table";
import { toast } from "sonner";

// tipos:
import { type User } from "@/prisma/client/client"

// componentes:
import { Button } from "@/components/ui/button"
import { Dialog, DialogClose, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Spinner } from "@/components/ui/spinner"

// ícones:
import { ArrowUpDown } from "lucide-react"

// Definição das colunas da tabela de Usuários
export const getUsersColumns = (organizationId: string): ColumnDef<User>[] => [
  {
    accessorKey: "email",
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
    accessorKey: "name",
    id: "Nome",
    header: "Nome",
  },
  {
    id: "Ações",
    header: "Ações",
    cell: ({ row }) => (
      <UserActionCell user={row.original} organizationId={organizationId} />
    ),
  },
]

function UserActionCell({ user, organizationId }: { user: User, organizationId: string }) {
  const [state, action, isPending] = useActionState(addMember, null)
  const [role, setRole] = useState<"member" | "admin" | "owner">("member")
  const router = useRouter()
  const [open, setOpen] = useState(false);

  async function act() {
    startTransition(() => {
      action({ organizationId, userId: user.id, role });
    });
  };

  // 2. O useEffect para monitorar a conclusão
  useEffect(() => {
    // Verifica se não está pendente E o estado indica sucesso
    if (!isPending && state?.success === true) {
      toast.success("Membro adicionado com sucesso.");
      setOpen(false);
      router.refresh();
    }
    // Opcional: Tratar erros
    if (!isPending && state?.success === false) {
      toast.error("Houve um erro ao adicionar o membro. Tente novamente.");
    }
  }, [isPending, state, router ]); // Dependências: Roda sempre que isPending ou state mudar

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">Adicionar</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Adicionar membro</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-4 py-4">
          <p>
            Você está prestes a adicionar
          </p>

          <div className="grid grid-cols-2">
            <div>
            <p className="font-bold text-xl">{user.name}</p>
            <p className="text-muted-foreground">{user.email}</p>
          </div>

          <div className="flex flex-col gap-2">
            <span className="text-sm font-medium">Como um</span>
            <Select value={role} onValueChange={(val: "member" | "admin" | "owner") => setRole(val)}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Selecione uma função" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="member">Membro</SelectItem>
                <SelectItem value="admin">Administrador</SelectItem>
                <SelectItem value="owner">Dono</SelectItem>
              </SelectContent>
            </Select>
          </div>
          </div>

          <p>A esta organização</p>
        </div>
        <DialogFooter className="">
          <DialogClose asChild>
            <Button variant="destructive">Cancelar</Button>
          </DialogClose>
          <DialogClose asChild>
            <Button onClick={() => act()}>
              {isPending ? <Spinner /> : "Adicionar"}
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
