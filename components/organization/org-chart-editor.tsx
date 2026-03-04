"use client";

import { useCallback, useEffect, useMemo, useState, useTransition } from "react";
import {
  addEdge,
  Background,
  Controls,
  MiniMap,
  ReactFlow,
  useEdgesState,
  useNodesState,
  type Connection,
  type Edge,
  type Node,
} from "@xyflow/react";
import { toast } from "sonner";

import { saveOrganizationChartLayout } from "@/server/actions/org-chart";
import { Button } from "@/components/ui/button";

interface OrgChartEditorProps {
  organizationSlug: string;
  chartId: string;
  canEdit: boolean;
  initialNodes: Node[];
  initialEdges: Edge[];
}

function reasonToMessage(reason: string | undefined) {
  switch (reason) {
    case "FORBIDDEN":
      return "Voce nao tem permissao para editar este organograma.";
    case "EMPTY_CHART":
      return "O organograma precisa ter ao menos um no.";
    case "CHART_NOT_FOUND":
      return "Nao foi possivel encontrar este organograma.";
    default:
      return "Nao foi possivel salvar o organograma.";
  }
}

export function OrgChartEditor({
  organizationSlug,
  chartId,
  canEdit,
  initialNodes,
  initialEdges,
}: OrgChartEditorProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [isSaving, startSaving] = useTransition();
  const [lastSavedAt, setLastSavedAt] = useState<string | null>(null);

  useEffect(() => {
    setNodes(initialNodes);
    setEdges(initialEdges);
  }, [initialEdges, initialNodes, setEdges, setNodes]);

  const onConnect = useCallback(
    (connection: Connection) => {
      if (!canEdit) return;

      const edgeId = `edge-${Date.now()}`;
      setEdges((currentEdges) =>
        addEdge(
          {
            ...connection,
            id: edgeId,
          },
          currentEdges,
        ),
      );
    },
    [canEdit, setEdges],
  );

  const addNode = useCallback(() => {
    if (!canEdit) return;

    const index = nodes.length + 1;
    const nodeId = `node-${Date.now()}`;
    const nextNode: Node = {
      id: nodeId,
      position: {
        x: 120 + (index % 3) * 220,
        y: 60 + index * 90,
      },
      data: {
        label: `Nova posicao ${index}`,
      },
    };

    setNodes((currentNodes) => [...currentNodes, nextNode]);
  }, [canEdit, nodes.length, setNodes]);

  const handleSave = useCallback(() => {
    if (!canEdit) return;

    startSaving(async () => {
      const result = await saveOrganizationChartLayout({
        organizationSlug,
        chartId,
        nodes,
        edges,
      });

      if (!result.success) {
        toast.error(reasonToMessage(result.reason));
        return;
      }

      const now = new Date().toLocaleTimeString("pt-BR", {
        hour: "2-digit",
        minute: "2-digit",
      });
      setLastSavedAt(now);
      toast.success("Organograma salvo com sucesso.");
    });
  }, [canEdit, organizationSlug, chartId, nodes, edges]);

  const headerText = useMemo(() => {
    if (canEdit) {
      return "Arraste os nos, conecte cargos e salve quando terminar.";
    }

    return "Modo visualizacao: apenas leitura para este usuario.";
  }, [canEdit]);

  return (
    <div className="flex h-full min-h-0 flex-col gap-3">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border bg-card p-3">
        <p className="text-sm text-muted-foreground">{headerText}</p>

        <div className="flex items-center gap-2">
          {canEdit && (
            <Button size="sm" variant="outline" onClick={addNode}>
              Adicionar no
            </Button>
          )}
          {canEdit && (
            <Button size="sm" onClick={handleSave} disabled={isSaving}>
              {isSaving ? "Salvando..." : "Salvar organograma"}
            </Button>
          )}
        </div>
      </div>

      <div className="flex-1 min-h-0 w-full overflow-hidden rounded-xl border bg-card">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          fitView
          onNodesChange={canEdit ? onNodesChange : undefined}
          onEdgesChange={canEdit ? onEdgesChange : undefined}
          onConnect={canEdit ? onConnect : undefined}
          nodesDraggable={canEdit}
          nodesConnectable={canEdit}
          elementsSelectable={canEdit}
          selectNodesOnDrag={canEdit}
          deleteKeyCode={canEdit ? ["Backspace", "Delete"] : null}
          proOptions={{
            hideAttribution: true,
          }}
        >
          <MiniMap />
          <Controls />
          <Background gap={16} size={1.2} />
        </ReactFlow>
      </div>

      <p className="text-xs text-muted-foreground">
        {lastSavedAt
          ? `Ultimo salvamento: ${lastSavedAt}`
          : "Ainda nao houve salvamento nesta sessao."}
      </p>
    </div>
  );
}
