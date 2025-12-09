// componentes:
import {
  CardContent
} from "@/app/(conta)/components/card-content";

import {
  GithubOauthButton,
  GoogleOauthButton,
  MicrosoftOauthButton,
} from "@/components/auth/buttons/oauth-buttons";
import { LoginForm } from "@/components/auth/forms/login";
import { Or } from "@/components/auth/or";
import { RaauthCardHeader } from "../components/raauth-card-header";
import { CardFooter } from "../components/card-footer";

export default function Page() {
  return (
    <>
      <RaauthCardHeader login />
      <CardContent>
        <div className="grid grid-cols-3 space-x-2">
          <MicrosoftOauthButton />
          <GoogleOauthButton />
          <GithubOauthButton />
        </div>
        <Or />
        <LoginForm />
      </CardContent>
      <CardFooter login />
    </>
  );
}
