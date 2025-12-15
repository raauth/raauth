"use client"

import { ColumnDef } from "@tanstack/react-table"
import { ArrowUpDown } from "lucide-react"

import { Button } from "@/components/ui/button"
import { type User } from "@/prisma/client/client"
import { addMember } from "@/auth/actions/members"
import { authClient } from "@/lib/auth-client"
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"

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

import { useState } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

function UserActionCell({ user, organizationId }: { user: User, organizationId: string }) {
  const [role, setRole] = useState<"member" | "admin" | "owner">("member")

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">Adicionar</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Adicionar membro</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-4 py-4">
          <p>
            Deseja adicionar {user.name} (<span className="text-muted-foreground">{user.email}</span>) a esta organização?
          </p>
          <div className="flex flex-col gap-2">
            <span className="text-sm font-medium">Função</span>
            <Select value={role} onValueChange={(val: "member" | "admin" | "owner") => setRole(val)}>
              <SelectTrigger>
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
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="destructive">Cancelar</Button>
          </DialogClose>
          <Button onClick={() => addMember({ organizationId, userId: user.id, role })}>
            Adicionar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
