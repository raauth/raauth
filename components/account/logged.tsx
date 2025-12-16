"use client";

// funções e libs:
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { type Organization } from "@/prisma/client/client";

// componentes:
import { AccessLevelIcon } from "@/components/account/access-level-icon";
import { OrganizationSwitcher } from "@/components/account/organization-switcher";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

// ícones:
import { ArrowDownUp, BriefcaseBusiness, CircleUser, LogOut, SquareUser } from "lucide-react";
import { AdminPanel } from "./buttons/admin-panel";


interface LoggedAccountProps {
  session?: {
    user?: {
      name?: string | null;
      email?: string | null;
      role?: string | null;
      image?: string | null;
    } | null;
  } | null;
  organizations: Organization[];
  preferredActiveOrganizationId?: string | null;
}

export function LoggedAccount({ session, organizations, preferredActiveOrganizationId }: LoggedAccountProps) {
  const router = useRouter();

  return (
    <>
      <DropdownMenuTrigger asChild>
        <Avatar>
          <AvatarImage src={session?.user?.image || undefined}
            alt="Foto de perfil do usuário" />
          <AvatarFallback aria-label="Avatar padrão">
            <CircleUser size={20} />
          </AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end">
        {/* Conteúdo do menu suspenso vai aqui */}
        <DropdownMenuLabel className="flex flex-col">
          {session?.user?.name}
          <span className="text-xs font-normal text-muted-foreground">{session?.user?.email}</span>
        </DropdownMenuLabel>

        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          {organizations.length > 0 && (
            <OrganizationSwitcher
              organizations={organizations}
              preferredActiveOrganizationId={preferredActiveOrganizationId}
            />
          )}

          {session?.user?.role && (
            <DropdownMenuItem>
              {session?.user?.role}
            </DropdownMenuItem>
          )}

          
            <AdminPanel />
          

          <DropdownMenuItem
            variant="destructive"
            onClick={async () => {
              await authClient.signOut({
                fetchOptions: {
                  onSuccess: () => {
                    router.push("/entrar"); // redirect to login page
                  },
                },
              });
            }}
          >
            <LogOut /> Sair
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </>
  );
}
