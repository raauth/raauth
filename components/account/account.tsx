"use client";

// funções e libs:
import { authClient } from "@/lib/auth-client";

// componentes:
import {
  DropdownMenu,
} from "@/components/ui/dropdown-menu";

// ícones:
import { UnloggedAccount } from "@/components/account/unlogged";
import { LoggedAccount } from "@/components/account/logged";

export function Account() {
  const { data: session } = authClient.useSession();
  const { data: organization } = authClient.useActiveOrganization();

  return (
    <DropdownMenu>
      {!session ? (
        <UnloggedAccount />
      ) : (
        <LoggedAccount session={session} organization={organization} />
      )}
    </DropdownMenu>
  );
}
