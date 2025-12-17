"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { createDashboard } from "@/auth/actions/dashboards";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import { Plus } from "lucide-react";

interface AddDashboardFormProps {
  organizationId: string;
  onSuccess?: () => void;
}

interface FormData {
  name: string;
  iframeUrl: string;
  description: string;
  requiredRole: string;
}

export function AddDashboardForm({ organizationId, onSuccess }: AddDashboardFormProps) {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { register, handleSubmit, reset, setValue, watch } = useForm<FormData>({
    defaultValues: {
      name: "",
      iframeUrl: "",
      description: "",
      requiredRole: "member",
    },
  });

  const requiredRole = watch("requiredRole");

  const onSubmit = async (data: FormData) => {
    setIsLoading(true);
    try {
      await createDashboard({
        name: data.name,
        iframeUrl: data.iframeUrl,
        description: data.description || undefined,
        requiredRole: data.requiredRole,
        organizationId,
      });
      toast.success("Dashboard criado com sucesso!");
      reset();
      setOpen(false);
      onSuccess?.();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erro ao criar dashboard");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Novo Dashboard
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Adicionar Dashboard</DialogTitle>
          <DialogDescription>
            Adicione um novo dashboard Power BI para esta organização.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome do Dashboard</Label>
            <Input
              id="name"
              placeholder="Ex: Inventário de TI"
              {...register("name", { required: true })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="iframeUrl">URL do Iframe</Label>
            <Input
              id="iframeUrl"
              placeholder="https://app.powerbi.com/..."
              {...register("iframeUrl", { required: true })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descrição (opcional)</Label>
            <Input
              id="description"
              placeholder="Breve descrição do dashboard"
              {...register("description")}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="requiredRole">Role Necessária</Label>
            <Select
              value={requiredRole}
              onValueChange={(value) => setValue("requiredRole", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione a role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="member">Member (todos)</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="owner">Owner</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Usuários com esta role ou superior poderão ver o dashboard.
            </p>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Criando..." : "Criar Dashboard"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
