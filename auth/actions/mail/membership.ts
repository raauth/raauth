import { type Organization, type User } from "@/prisma/client/client";
import { Resend } from "resend";

interface SendWelcomeEmailParams {
  user: User;
  org: Organization;
} 

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendWelcomeEmail({
  user,
  org
}: SendWelcomeEmailParams ) {
  const { data, error } = await resend.emails.send({
    from: "Raauth <membership@mail.raave.dev>",
    to: [user.email],
    subject: "Bem-vindo à organização",
    text: `Oi, ${user.name}. Você foi adicionado à ${org.name}`
  });

  if(error) {
    return {
      success: false,
      message: "Houve um erro enviar o e-mail de boas-vindas."
    }
  }

  return {
    success: true,
    message: "Foi enviado um e-mail de boas-vindas",
    data: data?.id
  }
}

export async function sendRemovalEmail({
  user,
  org
}: SendWelcomeEmailParams ) {
  const { data, error } = await resend.emails.send({
    from: "Raauth <membership@mail.raave.dev>",
    to: [user.email],
    subject: "Remoção da organização",
    text: `Oi, ${user.name}. Você foi removido da ${org.name}`
  });

  if(error) {
    return {
      success: false,
      message: "Houve um erro enviar o e-mail de boas-vindas."
    }
  }

  return {
    success: true,
    message: "Foi enviado um e-mail de boas-vindas",
    data: data?.id
  }
}