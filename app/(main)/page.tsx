import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Copy } from "lucide-react";
import Link from "next/link";

export default  function Page() {
  return (
    <>
     <Card className="w-sm">
      <CardHeader>
        <CardTitle className="text-2xl">
          Inventário de TI
        </CardTitle>
        <CardDescription>
          Vê o dashboard do inventário de TI
        </CardDescription>
      </CardHeader>
      <CardFooter className="gap-2">
        <Button asChild>
          <Link href="/inventory">
            Abrir
          </Link>
        </Button>
        <Button>
          <Copy/> Copiar link
        </Button>
      </CardFooter>
     </Card>
    </>
  );
}
