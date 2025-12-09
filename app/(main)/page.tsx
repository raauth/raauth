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
export default async function Page() {
  return (
    <>
     {/* TODO: Deixar isso aqui completinho com a criação de organização mais bonita */}
      <Dialog>
        <DialogTrigger asChild>
          <Button>Criar organização</Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Criar organização</DialogTitle>
            <CreateOrganizationForm />
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </>
  );
}
