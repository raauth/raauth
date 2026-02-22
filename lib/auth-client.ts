import { createAuthClient } from "better-auth/react";
import {
  organizationClient,
  twoFactorClient,
  usernameClient,
} from "better-auth/client/plugins";
import { passkeyClient } from "@better-auth/passkey/client";

import { ac, owner, admin, member } from "@/server/permissions";

// Usamos `any` aqui como workaround conhecido para a issue do Better Auth v1.4
// com tsconfig `moduleResolution: "bundler"`, que causa TS2742 e falha na inferência dos plugins
// Referência: https://github.com/better-auth/better-auth/issues/6565
const client = createAuthClient({
  baseURL: process.env.BETTER_AUTH_URL,
  plugins: [
    organizationClient({
      ac,
      roles: {
        owner,
        admin,
        member,
      },
    }),
    twoFactorClient(),
    passkeyClient() as any,
    usernameClient(),
  ],
});

export const authClient = client as any;