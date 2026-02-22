import { type User } from "@/prisma/client/client";
import { Resend } from "resend";

interface ResetPasswordEmailParams {
  user: { name: string; email: string };
  url: string;
}

const resend = new Resend(process.env.RESEND_API_KEY);

import { ResetPasswordEmail } from "../../emails/reset-password";

// ============================================================
// 🔐 sendResetPasswordEmail
// ============================================================
// Envia e-mail contendo o link de recuperação de senha.
// ============================================================
export async function sendResetPasswordEmail({ user, url }: ResetPasswordEmailParams) {
  const { data, error } = await resend.emails.send({
    from: "Raauth <auth@mail.raave.dev>",
    to: [user.email],
    subject: "Redefinir sua senha",
    react: ResetPasswordEmail({ userFirstname: user.name, resetPasswordUrl: url }),
  });

  if (error) {
    console.error("Erro ao enviar e-mail de recuperação de senha:", error);
    return {
      success: false,
      message: "Houve um erro ao enviar o e-mail de recuperação de senha.",
    };
  }

  return {
    success: true,
    message: "Foi enviado um e-mail de recuperação de senha",
    data: data?.id,
  };
}
