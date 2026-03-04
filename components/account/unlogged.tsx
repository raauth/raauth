import {
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Link from "next/link";

import { LogIn, SquareUser, UserPlus } from "lucide-react";
import { ThemeToggle } from "@/components/ui/theme-toggle";

export function UnloggedAccount() {
  return (
    <>
      <div className="flex min-w-0 items-center gap-1.5">
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            className="flex min-w-0 flex-1 items-center gap-2 rounded-md px-1.5 py-1.5 text-left transition-colors hover:bg-sidebar-accent focus-visible:ring-2 focus-visible:ring-sidebar-ring focus-visible:outline-none"
          >
            <span className="flex size-8 items-center justify-center rounded-full bg-muted text-muted-foreground">
              <SquareUser className="size-4" />
            </span>
            <span className="truncate text-sm font-medium">Conta</span>
          </button>
        </DropdownMenuTrigger>
        <ThemeToggle className="shrink-0" />
      </div>

      <DropdownMenuContent align="start" side="bottom" className="w-56">
        {/* Conteúdo do menu suspenso para usuário não autenticado */}
        <DropdownMenuLabel>Acesse sua conta</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem asChild>
            <Link href="/entrar">
              <LogIn />
              Entrar
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/criar-conta">
              <UserPlus />
              Criar conta
            </Link>
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </>
  );
}
