import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { auth } from "@/lib/auth";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { CreateOrganizationForm } from "@/components/forms/create-organization-form";
import { Button } from "@/components/ui/button";
import { OrganizationSwitcher } from "@/components/account/organization-switcher";
import { getOrganizations } from "@/lib/account-actions/get-organization";
export default async function Page() {
  const organizations = await getOrganizations();
  const session = await auth.api.getSession({
    headers: await headers(), // you need to pass the headers object.
  });

  if (!session) {
    redirect("/login");
  }

  return (
    <>
      <Dialog>
      <DialogTrigger asChild>
        <Button>Criar organização</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Are you absolutely sure?</DialogTitle>
           <CreateOrganizationForm />
        </DialogHeader>
      </DialogContent>
    </Dialog>

    <OrganizationSwitcher organizations={organizations} />
    </>
  );
}
