"use client";

import { useRouter } from "next/navigation";
import { AddDashboardForm } from "@/components/dashboard/add-dashboard-form";
import { DashboardsTable } from "@/components/dashboard/dashboards-table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Dashboard {
  id: string;
  name: string;
  iframeUrl: string;
  description: string | null;
  requiredRole: string;
}

interface DashboardsManagementProps {
  dashboards: Dashboard[];
  organizationId: string;
}

export function DashboardsManagement({ dashboards, organizationId }: DashboardsManagementProps) {
  const router = useRouter();

  const handleRefresh = () => {
    router.refresh();
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Dashboards</CardTitle>
        <AddDashboardForm organizationId={organizationId} onSuccess={handleRefresh} />
      </CardHeader>
      <CardContent>
        <DashboardsTable dashboards={dashboards} onUpdate={handleRefresh} />
      </CardContent>
    </Card>
  );
}
