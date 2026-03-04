"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { AccessLevelIcon } from "@/components/account/access-level-icon";
import { AdminPanel } from "./buttons/admin-panel";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import {
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CircleUser, LogOut, Settings } from "lucide-react";

interface LoggedAccountProps {
  organizationSlug?: string | null;
  session?: {
    user?: {
      name?: string | null;
      email?: string | null;
      role?: string | null;
      image?: string | null;
    } | null;
  } | null;
}

export function LoggedAccount({
  organizationSlug,
  session,
}: LoggedAccountProps) {
  const router = useRouter();
  const displayName = session?.user?.name?.trim() || "Conta";
  const displayEmail = session?.user?.email?.trim() || "Sem e-mail";

  return (
    <>
      <div className="flex min-w-0 items-center gap-1.5">
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            className="flex min-w-0 flex-1 items-center gap-2 rounded-md px-1.5 py-1.5 text-left transition-colors hover:bg-sidebar-accent focus-visible:ring-2 focus-visible:ring-sidebar-ring focus-visible:outline-none"
          >
            <Avatar className="size-8">
              <AvatarImage
                src={session?.user?.image || undefined}
                alt={`Foto de perfil de ${displayName}`}
              />
              <AvatarFallback aria-label="Avatar padrão">
                <CircleUser size={18} />
              </AvatarFallback>
            </Avatar>
            <span className="truncate text-sm font-medium">{displayName}</span>
          </button>
        </DropdownMenuTrigger>
        <ThemeToggle className="shrink-0" />
      </div>

      <DropdownMenuContent align="start" side="bottom" className="w-60">
        <DropdownMenuLabel className="flex flex-col">
          {displayName}
          <span className="text-xs font-normal text-muted-foreground">
            {displayEmail}
          </span>
        </DropdownMenuLabel>

        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem asChild>
            <Link href="/configuracoes/conta">
              <Settings className="size-4" />
              Configurações
            </Link>
          </DropdownMenuItem>

          {session?.user?.role && <AccessLevelIcon level={session.user.role} />}

          <AdminPanel organizationSlug={organizationSlug} />

          <DropdownMenuItem
            variant="destructive"
            onClick={async () => {
              await authClient.signOut({
                fetchOptions: {
                  onSuccess: () => {
                    router.push("/entrar");
                  },
                },
              });
            }}
          >
            <LogOut />
            Sair
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </>
  );
}
