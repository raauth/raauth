// funções e libs:
import { auth } from "@/lib/auth";

// componentes:
import { DropdownMenu } from "@/components/ui/dropdown-menu";

// ícones:
import { UnloggedAccount } from "@/components/account/unlogged";
import { LoggedAccount } from "@/components/account/logged";
import { headers } from "next/headers";

interface AccountProps {
  organizationSlug?: string | null;
}

export async function Account({ organizationSlug }: AccountProps) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  return (
    <DropdownMenu>
      {!session ? (
        <UnloggedAccount />
      ) : (
        <LoggedAccount session={session} organizationSlug={organizationSlug} />
      )}
    </DropdownMenu>
  );
}
