"use client";

// funções e libs:
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";

// componentes:
import { AccessLevelIcon } from "@/components/account/access-level-icon";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// ícones:
import { LogOut, SquareUser } from "lucide-react";


interface LoggedAccountProps {
  session?: {
    user?: {
      name?: string | null;
      email?: string | null;
      role?: string | null;
      image?: string | null;
    } | null;
  } | null;
  organization?: {
    name?: string | null;
  } | null;
}

export function LoggedAccount({ session, organization }: LoggedAccountProps) {
  const router = useRouter();

  return (
    <>
      <DropdownMenuTrigger asChild>
        <Avatar>
          <AvatarImage src={session?.user?.image || undefined}
            alt="@evilrabbit" />
          <AvatarFallback><SquareUser /></AvatarFallback>
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
          { organization && (
            <DropdownMenuItem>
              {organization?.name}
            </DropdownMenuItem>
          )}
          
          { session?.user?.role && (
            <DropdownMenuItem>
              {session?.user?.role}
            </DropdownMenuItem>
          )}
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
