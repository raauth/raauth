
// componentes:
import {
  CardContent
} from "@/app/(conta)/components/card-content";
import { RaauthCardHeader } from "@/app/(conta)/components/raauth-card-header";
import { RegisterForm } from "@/components/auth/forms/register";
import { CardFooter } from "../components/card-footer";

export default function Page() {
  return (
    <>
      <RaauthCardHeader />
      <CardContent>
        <RegisterForm />
      </CardContent>
      <CardFooter />
    </>
  );
}
