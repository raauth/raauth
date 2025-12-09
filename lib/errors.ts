import { authClient } from "@/lib/auth-client";

type ErrorTypes = Partial<
	Record<
		keyof typeof authClient.$ERROR_CODES,
		{
			pt_br: string;
		}
	>
>;
 
const errorCodes = {
	USER_ALREADY_EXISTS: {
		pt_br: "Esse e-mail já está registrado."
	},
  INVALID_EMAIL_OR_PASSWORD: {
    pt_br: "Login ou senha inválidos."
  },
	EMAIL_NOT_VERIFIED: {
		pt_br: "Verifique seu e-mail antes de continuar."
	},
	USER_EMAIL_NOT_FOUND: {
		pt_br: "Nenhum usuário encontrado com esse e-mail."
	},
} satisfies ErrorTypes;
 
export const getErrorMessage = (code: string, lang: "pt_br" = "pt_br") => {
	if (code in errorCodes) {
		return errorCodes[code as keyof typeof errorCodes][lang];
	}
	return "Ocorreu um erro inesperado. Por favor, tente novamente.";
};