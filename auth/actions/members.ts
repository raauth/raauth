// TODO: Refatorar os try catch para encontrar um fluxo mais seguro de operações e envio de emails.

"use server"

import { auth } from "@/lib/auth"
import { headers } from "next/headers";

import { sendRemovalEmail, sendWelcomeEmail } from "./mail/membership";

import { db } from "@/lib/db";

// função para adicionar um membro a uma organização
interface AddMemberProps {
  organizationId: string;
  userId: string;
  role: "member" | "owner" | "admin";
}

interface AddMemberResult {
  success: boolean;
}

export async function addMember(
  _prevState: AddMemberResult | null,
  { organizationId, userId, role }: AddMemberProps
): Promise<AddMemberResult> {
  try {
    // 1. Adiciona o membro
    await auth.api.addMember({
      body: {
        userId,
        organizationId,
        role
      }
    })

    // 2. Busca dados necessários
    const [memberUser, org] = await Promise.all([
      db.user.findUnique({
        where: { id: userId }
      }),
      db.organization.findUnique({
        where: { id: organizationId }
      })
    ])

    if (!memberUser) {
      throw new Error("Usuário não encontrado")
    }

    if (!org) {
      throw new Error("Organização não encontrada")
    }

    // 3. Envia o email (se falhar, falha tudo)
    await sendWelcomeEmail({ user: memberUser, org })

    // 4. Só chega aqui se absolutamente tudo deu certo
    return { success: true }
  } catch (error) {
    console.log(error)
    return { success: false }
  }
}

// função para remover um membro de uma organização
interface RemoveMemberProps {
  memberId: string;
  organizationId: string;
}

interface RemoveMemberResult {
  success: boolean;
}

export async function removeMember(
  _prevState: RemoveMemberResult | null,
  { organizationId, memberId }: RemoveMemberProps
): Promise<RemoveMemberResult> {
  try {
    // 1. Busca dados necessários ANTES de remover, para ter os dados do usuário para o email
    const member = await db.member.findUnique({
      where: {
        id: memberId,
        organizationId: organizationId
      },
      include: {
        user: true,
      }
    });

    if (!member) {
      throw new Error("Membro não encontrado");
    }

    const org = await db.organization.findUnique({
      where: { id: organizationId }
    });


    if (!org) {
      throw new Error("Organização não encontrada");
    }

    // 2. Remove o membro na API
    await auth.api.removeMember({
      body: {
        memberIdOrEmail: memberId,
        organizationId,
      },

      headers: await headers()
    })


    // 3. Envia o email (se falhar, apenas loga, pois a remoção já ocorreu/está em processo)
    try {
      await sendRemovalEmail({ user: member.user, org })
    } catch (emailError) {
      console.error("Erro ao enviar email de remoção:", emailError);
      // Não vamos falhar a request inteira se o email falhar, pois o membro já foi removido (ou a ordem de operações sugere isso)
      // Mas note que no código original, se API falhar, lançava erro. Se email falhasse, também retornava falha mas API já tinha sido chamada?
      // O código original chamava auth.api.removeMember PRIMEIRO.
      // Se a API do auth remove o membro do banco, então db.member.findUnique falharia se chamado depois.
      // Por isso mudei a ordem: Buscar dados -> Remover -> Enviar Email.
    }

    // 4. Sucesso
    return { success: true }
  } catch (error) {
    console.log(error)
    return { success: false }
  }
}