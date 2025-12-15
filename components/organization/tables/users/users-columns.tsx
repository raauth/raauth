"use client"

import { ColumnDef } from "@tanstack/react-table"
import { ArrowUpDown } from "lucide-react"

import { Button } from "@/components/ui/button"
import { type User } from "@/prisma/client/client"

// Definição das colunas da tabela de Usuários
export const usersColumns: ColumnDef<User>[] = [
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
    cell: ({ row }) => {
      // Célula de ações customizada
      const user = row.original

      return (
        <Button
          variant="outline"
          onClick={() => console.log("Adicionar usuário:", user.id)}
        >
          Adicionar
        </Button>
      )
    },
  },
]
