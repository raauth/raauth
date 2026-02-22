// ============================================================
// 🎭 MAPEAMENTO DE ERROS (Internacionalização)
// ============================================================
// O Better Auth retorna códigos de erro em inglês (ex:
// "USER_ALREADY_EXISTS"). Este arquivo traduz esses códigos
// para mensagens amigáveis em português brasileiro.
//
// 📌 COMO FUNCIONA:
// 1. O authClient dispara um erro com um código (ctx.error.code)
// 2. Chamamos getErrorMessage(code) para obter a tradução
// 3. Mostramos ao usuário via toast.error()
//
// 🐤 Analogia: é como um dicionário de erros — o sistema fala
// em inglês técnico, e este arquivo traduz para o "humano".
//
// 💡 PONTO DE EXTENSÃO: ao adicionar novos plugins (ex:
// twoFactor), adicione os novos códigos de erro aqui.
// Veja todos os códigos em:
// https://better-auth.com/docs/reference/error-codes
// ============================================================

import { authClient } from "@/lib/auth-client";

// Tipo que garante que só usamos códigos de erro que o
// Better Auth realmente retorna. Previne erros de digitação.
type ErrorTypes = Partial<
	Record<
		keyof typeof authClient.$ERROR_CODES,
		{
			pt_br: string;
		}
	>
>;

// Mapeamento de códigos de erro → mensagens em português.
// Adicione novos erros conforme necessário.
const errorCodes = {
	USER_ALREADY_EXISTS: {
		pt_br: "Esse e-mail já está registrado.",
	},
	INVALID_EMAIL_OR_PASSWORD: {
		pt_br: "Login ou senha inválidos.",
	},
	EMAIL_NOT_VERIFIED: {
		pt_br: "Verifique seu e-mail antes de continuar.",
	},
	USER_EMAIL_NOT_FOUND: {
		pt_br: "Nenhum usuário encontrado com esse e-mail.",
	},
} satisfies ErrorTypes;

// Função que recebe um código de erro e retorna a mensagem
// traduzida. Se o código não estiver mapeado, retorna uma
// mensagem genérica.
export const getErrorMessage = (code: string, lang: "pt_br" = "pt_br") => {
	if (code in errorCodes) {
		return errorCodes[code as keyof typeof errorCodes][lang];
	}
	return "Ocorreu um erro inesperado. Por favor, tente novamente.";
};