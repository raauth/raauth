"use client";

import { useState } from "react";
import { toast } from "sonner";
import { deleteDashboard, updateDashboard } from "@/auth/actions/dashboards";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Pencil, Trash2, ExternalLink } from "lucide-react";

interface Dashboard {
  id: string;
  name: string;
  iframeUrl: string;
  description: string | null;
  requiredRole: string;
}

interface DashboardsTableProps {
  dashboards: Dashboard[];
  onUpdate?: () => void;
}

const roleLabels: Record<string, string> = {
  member: "Member",
  admin: "Admin",
  owner: "Owner",
};

const roleBadgeVariants: Record<string, "default" | "secondary" | "destructive"> = {
  member: "secondary",
  admin: "default",
  owner: "destructive",
};

export function DashboardsTable({ dashboards, onUpdate }: DashboardsTableProps) {
  const [editingDashboard, setEditingDashboard] = useState<Dashboard | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    iframeUrl: "",
    description: "",
    requiredRole: "member",
  });

  const handleEdit = (dashboard: Dashboard) => {
    setEditingDashboard(dashboard);
    setFormData({
      name: dashboard.name,
      iframeUrl: dashboard.iframeUrl,
      description: dashboard.description || "",
      requiredRole: dashboard.requiredRole,
    });
  };

  const handleSaveEdit = async () => {
    if (!editingDashboard) return;
    setIsLoading(true);
    try {
      await updateDashboard(editingDashboard.id, {
        name: formData.name,
        iframeUrl: formData.iframeUrl,
        description: formData.description || undefined,
        requiredRole: formData.requiredRole,
      });
      toast.success("Dashboard atualizado com sucesso!");
      setEditingDashboard(null);
      onUpdate?.();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erro ao atualizar dashboard");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir este dashboard?")) return;

    setIsLoading(true);
    try {
      await deleteDashboard(id);
      toast.success("Dashboard excluído com sucesso!");
      onUpdate?.();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erro ao excluir dashboard");
    } finally {
      setIsLoading(false);
    }
  };

  if (dashboards.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Nenhum dashboard cadastrado ainda.
      </div>
    );
  }

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nome</TableHead>
            <TableHead>Descrição</TableHead>
            <TableHead>Role</TableHead>
            <TableHead className="w-[150px]">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {dashboards.map((dashboard) => (
            <TableRow key={dashboard.id}>
              <TableCell className="font-medium">{dashboard.name}</TableCell>
              <TableCell className="text-muted-foreground">
                {dashboard.description || "-"}
              </TableCell>
              <TableCell>
                <Badge variant={roleBadgeVariants[dashboard.requiredRole] || "secondary"}>
                  {roleLabels[dashboard.requiredRole] || dashboard.requiredRole}
                </Badge>
              </TableCell>
              <TableCell>
                <div className="flex gap-2">
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => window.open(dashboard.iframeUrl, "_blank")}
                    title="Abrir URL"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => handleEdit(dashboard)}
                    title="Editar"
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => handleDelete(dashboard.id)}
                    disabled={isLoading}
                    title="Excluir"
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Dialog open={!!editingDashboard} onOpenChange={() => setEditingDashboard(null)}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Editar Dashboard</DialogTitle>
            <DialogDescription>
              Faça alterações no dashboard selecionado.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Nome do Dashboard</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-iframeUrl">URL do Iframe</Label>
              <Input
                id="edit-iframeUrl"
                value={formData.iframeUrl}
                onChange={(e) => setFormData({ ...formData, iframeUrl: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-description">Descrição</Label>
              <Input
                id="edit-description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-requiredRole">Role Necessária</Label>
              <Select
                value={formData.requiredRole}
                onValueChange={(value) => setFormData({ ...formData, requiredRole: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="member">Member (todos)</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="owner">Owner</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => setEditingDashboard(null)}>
                Cancelar
              </Button>
              <Button onClick={handleSaveEdit} disabled={isLoading}>
                {isLoading ? "Salvando..." : "Salvar"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
