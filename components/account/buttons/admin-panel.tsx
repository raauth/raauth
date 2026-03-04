import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { authClient } from "@/lib/auth-client";
import { IdCardLanyard } from "lucide-react";
import Link from "next/link";

interface AdminPanelProps {
  organizationSlug?: string | null;
}

export function AdminPanel({ organizationSlug }: AdminPanelProps){
  const { data: activeOrganization } = authClient.useActiveOrganization();
  const targetOrganizationSlug = activeOrganization?.slug ?? organizationSlug ?? null;

  if (!targetOrganizationSlug) {
    return null;
  }

  return(
    // TODO: implementar checagem de roles
    <DropdownMenuItem asChild>
      <Link href={`/org/${targetOrganizationSlug}`}>
        <IdCardLanyard />
        Gerenciar Organização
      </Link>
    </DropdownMenuItem>
  )
}
