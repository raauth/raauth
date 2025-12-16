import { Resend } from "resend";

interface SendWelcomeEmailParams {
  name: string;
  email: string
} 

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendWelcomeEmail({
  name,
  email
}: SendWelcomeEmailParams ) {
  const { data, error } = await resend.emails.send({
    from: "Raauth <welcome@mail.raave.dev>",
    to: [email],
    subject: "Bem-vindo à organização",
    text: `Oi, ${name}. Você foi adicionado à alguma coisa`
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