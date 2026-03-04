"use client";

import { useCallback, useEffect, useMemo, useState, useTransition } from "react";
import { createPortal } from "react-dom";
import {
  addEdge,
  Background,
  Controls,
  MiniMap,
  ReactFlow,
  useEdgesState,
  useNodesState,
  type NodeMouseHandler,
  type Connection,
  type Edge,
  type Node,
} from "@xyflow/react";
import { useTheme } from "next-themes";
import { toast } from "sonner";

import { OrgChartPersonNode } from "@/components/organization/org-chart-person-node";
import { saveOrganizationChartLayout } from "@/server/actions/org-chart";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  ORG_CHART_NODE_TYPE,
  createOrgChartNodeData,
  normalizeOrgChartNodeData,
  type OrgChartNodeData,
} from "@/lib/org-chart-node";

interface OrgChartEditorProps {
  organizationSlug: string;
  chartId: string;
  canEdit: boolean;
  initialNodes: Node[];
  initialEdges: Edge[];
}

type OrgChartFlowNode = Node<OrgChartNodeData, string>;

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
  const { resolvedTheme } = useTheme();
  const normalizedInitialNodes = useMemo<OrgChartFlowNode[]>(
    () =>
      initialNodes.map((node) => ({
        ...node,
        type: ORG_CHART_NODE_TYPE,
        data: normalizeOrgChartNodeData(node.data),
      })),
    [initialNodes],
  );

  const [nodes, setNodes, onNodesChange] = useNodesState<OrgChartFlowNode>(normalizedInitialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [isSaving, startSaving] = useTransition();
  const [lastSavedAt, setLastSavedAt] = useState<string | null>(null);
  const [editingNodeId, setEditingNodeId] = useState<string | null>(null);
  const [nodeDraft, setNodeDraft] = useState<OrgChartNodeData | null>(null);
  const headerActionsTarget =
    typeof document === "undefined"
      ? null
      : document.getElementById("org-workspace-header-actions");
  const isDarkMode = resolvedTheme === "dark";
  const selectedNode = useMemo(
    () => nodes.find((node) => node.selected) ?? null,
    [nodes],
  );
  const nodeTypes = useMemo(
    () => ({
      [ORG_CHART_NODE_TYPE]: OrgChartPersonNode,
    }),
    [],
  );
  const defaultEdgeOptions = useMemo(
    () => ({
      type: "smoothstep",
      style: {
        stroke: isDarkMode ? "rgba(148, 163, 184, 0.65)" : "rgba(71, 85, 105, 0.55)",
        strokeWidth: 1.6,
      },
    }),
    [isDarkMode],
  );

  useEffect(() => {
    setNodes(normalizedInitialNodes);
    setEdges(initialEdges);
  }, [initialEdges, normalizedInitialNodes, setEdges, setNodes]);

  const openNodeEditor = useCallback(
    (targetNode: OrgChartFlowNode) => {
      if (!canEdit) return;

      setEditingNodeId(targetNode.id);
      setNodeDraft(normalizeOrgChartNodeData(targetNode.data));
    },
    [canEdit],
  );

  const closeNodeEditor = useCallback(() => {
    setEditingNodeId(null);
    setNodeDraft(null);
  }, []);

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
    const anchorNode = nodes.find((node) => node.selected) ?? nodes[0] ?? null;
    const siblingCount = anchorNode
      ? edges.filter((edge) => edge.source === anchorNode.id).length
      : nodes.length;
    const siblingColumn = siblingCount % 3;
    const siblingRow = Math.floor(siblingCount / 3);
    const baseX = anchorNode?.position.x ?? 0;
    const baseY = anchorNode?.position.y ?? 0;
    const nextNode: OrgChartFlowNode = {
      id: nodeId,
      type: ORG_CHART_NODE_TYPE,
      position: {
        x: baseX + (siblingColumn - 1) * 180,
        y: baseY + 150 + siblingRow * 110,
      },
      data: createOrgChartNodeData({
        name: `Nova posicao ${index}`,
      }),
    };

    setNodes((currentNodes) => [...currentNodes, nextNode]);
  }, [canEdit, edges, nodes, setNodes]);

  const onNodeDoubleClick = useCallback<NodeMouseHandler<OrgChartFlowNode>>(
    (_event, clickedNode) => {
      openNodeEditor(clickedNode);
    },
    [openNodeEditor],
  );

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

  const handleNodeDraftSave = useCallback(() => {
    if (!canEdit || !editingNodeId || !nodeDraft) return;

    const normalizedDraft = normalizeOrgChartNodeData(nodeDraft);
    setNodes((currentNodes) =>
      currentNodes.map((currentNode) =>
        currentNode.id === editingNodeId
          ? {
              ...currentNode,
              type: ORG_CHART_NODE_TYPE,
              data: normalizedDraft,
            }
          : currentNode,
      ),
    );

    closeNodeEditor();
    toast.success("No atualizado.");
  }, [canEdit, closeNodeEditor, editingNodeId, nodeDraft, setNodes]);

  const headerActions = useMemo(() => {
    if (!canEdit) {
      return null;
    }

    return (
      <div className="flex items-center gap-2">
        <Button size="sm" variant="outline" onClick={addNode}>
          Adicionar no
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={() => selectedNode && openNodeEditor(selectedNode)}
          disabled={!selectedNode}
        >
          Editar no
        </Button>
        <Button size="sm" onClick={handleSave} disabled={isSaving}>
          {isSaving ? "Salvando..." : "Salvar organograma"}
        </Button>
      </div>
    );
  }, [addNode, canEdit, handleSave, isSaving, openNodeEditor, selectedNode]);

  return (
    <div className="flex h-full min-h-0 flex-col gap-3">
      {headerActionsTarget && headerActions
        ? createPortal(headerActions, headerActionsTarget)
        : null}

      <div className="flex-1 min-h-0 w-full overflow-hidden rounded-xl border bg-card">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          colorMode={isDarkMode ? "dark" : "light"}
          fitView
          onNodesChange={canEdit ? onNodesChange : undefined}
          onEdgesChange={canEdit ? onEdgesChange : undefined}
          onConnect={canEdit ? onConnect : undefined}
          onNodeDoubleClick={canEdit ? onNodeDoubleClick : undefined}
          nodesDraggable={canEdit}
          nodesConnectable={canEdit}
          elementsSelectable={canEdit}
          selectNodesOnDrag={canEdit}
          deleteKeyCode={canEdit ? ["Backspace", "Delete"] : null}
          defaultEdgeOptions={defaultEdgeOptions}
          proOptions={{
            hideAttribution: true,
          }}
        >
          <MiniMap
            className="!rounded-md !border !border-border !bg-card"
            nodeColor={(node) => normalizeOrgChartNodeData(node.data).accentColor}
            bgColor={isDarkMode ? "rgba(17, 24, 39, 0.8)" : "rgba(255, 255, 255, 0.85)"}
            maskColor={isDarkMode ? "rgba(2, 6, 23, 0.22)" : "rgba(15, 23, 42, 0.08)"}
          />
          <Controls />
          <Background
            gap={16}
            size={1.2}
            color={isDarkMode ? "rgba(148, 163, 184, 0.26)" : "rgba(71, 85, 105, 0.2)"}
          />
        </ReactFlow>
      </div>

      <p className="text-xs text-muted-foreground">
        {lastSavedAt
          ? `Ultimo salvamento: ${lastSavedAt}`
          : "Ainda nao houve salvamento nesta sessao."}
      </p>

      <Dialog open={Boolean(editingNodeId && nodeDraft)} onOpenChange={(isOpen) => !isOpen && closeNodeEditor()}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Editar no</DialogTitle>
            <DialogDescription>
              Atualize foto, nome, cargo e destaque visual deste no.
            </DialogDescription>
          </DialogHeader>

          {nodeDraft && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="node-avatar-url">Foto (URL)</Label>
                <Input
                  id="node-avatar-url"
                  type="url"
                  value={nodeDraft.avatarUrl ?? ""}
                  onChange={(event) =>
                    setNodeDraft((currentDraft) =>
                      currentDraft
                        ? {
                            ...currentDraft,
                            avatarUrl: event.target.value,
                          }
                        : currentDraft,
                    )
                  }
                  placeholder="https://..."
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="node-name">Nome</Label>
                <Input
                  id="node-name"
                  value={nodeDraft.name}
                  onChange={(event) =>
                    setNodeDraft((currentDraft) =>
                      currentDraft
                        ? {
                            ...currentDraft,
                            name: event.target.value,
                          }
                        : currentDraft,
                    )
                  }
                  maxLength={80}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="node-role">Cargo</Label>
                <Input
                  id="node-role"
                  value={nodeDraft.role}
                  onChange={(event) =>
                    setNodeDraft((currentDraft) =>
                      currentDraft
                        ? {
                            ...currentDraft,
                            role: event.target.value,
                          }
                        : currentDraft,
                    )
                  }
                  maxLength={80}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="node-accent-color">Cor de destaque</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="node-accent-color"
                    value={nodeDraft.accentColor}
                    onChange={(event) =>
                      setNodeDraft((currentDraft) =>
                        currentDraft
                          ? {
                              ...currentDraft,
                              accentColor: event.target.value,
                            }
                          : currentDraft,
                      )
                    }
                    placeholder="#3b82f6"
                  />
                  <input
                    type="color"
                    value={nodeDraft.accentColor}
                    onChange={(event) =>
                      setNodeDraft((currentDraft) =>
                        currentDraft
                          ? {
                              ...currentDraft,
                              accentColor: event.target.value,
                            }
                          : currentDraft,
                      )
                    }
                    className="h-10 w-12 cursor-pointer rounded-md border border-input bg-transparent p-1"
                    aria-label="Selecionar cor de destaque"
                  />
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={closeNodeEditor}>
              Cancelar
            </Button>
            <Button
              type="button"
              onClick={handleNodeDraftSave}
              disabled={!nodeDraft || nodeDraft.name.trim().length === 0}
            >
              Aplicar alteracoes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
