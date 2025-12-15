"use client"

import { ColumnDef } from "@tanstack/react-table"
import { ArrowUpDown } from "lucide-react"

import { Button } from "@/components/ui/button"
import { type Member } from "@/prisma/client/client"

// Definição das colunas da tabela de Usuários
export const membersColumns: ColumnDef<Member>[] = [
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
      const member = row.original

      return (
        <Button
          variant="destructive"
          onClick={() => console.log("Adicionar usuário:", member.id)}
        >
          Remover
        </Button>
      )
    },
  },
]
