"use server";

// libs e funções:
import { auth } from "@/lib/auth"
import { headers } from "next/headers";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";

export async function getCurrentUser() {
  // verifica se o usuário está logado:
   const session = await auth.api.getSession({
    headers: await headers(),
   }) 

   // redireciona para a tela de login se o usuário não estiver logado:
   if (!session) {
    redirect("/entrar");
   }

   // verifica se o usuário existe:
   const currentUser = await db.user.findUnique({
    where: {
        id: session.user.id,
    }
   })

   // redireciona para a tela de login se o usuário não existir:
   if (!currentUser) {
    redirect("/entrar");
   }

   return {
    ...session,
    currentUser
   }
}
