// componentes:
import { Card, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { LinkButtons } from "./link-buttons";

interface DashboardsCardProps {
  title: string;
  description: string;
  href: string;
}

export function DashboardsCard({ title, description, href }: DashboardsCardProps) {


  return (
    <Card className="w-sm">
      <CardHeader>
        <CardTitle className="text-2xl">
          {title}
        </CardTitle>
        <CardDescription>
          {description}
        </CardDescription>
      </CardHeader>
      <CardFooter className="gap-2">
        <LinkButtons href={href} />
      </CardFooter>
    </Card>
  )
}