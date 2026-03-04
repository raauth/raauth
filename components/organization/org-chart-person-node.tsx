"use client";

import { Handle, Position, type NodeProps } from "@xyflow/react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { normalizeOrgChartNodeData } from "@/lib/org-chart-node";
import { cn } from "@/lib/utils";

function getInitials(name: string) {
  const parts = name
    .split(" ")
    .map((part) => part.trim())
    .filter(Boolean)
    .slice(0, 2);

  if (parts.length === 0) return "N";
  if (parts.length === 1) return parts[0].slice(0, 1).toUpperCase();
  return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
}

export function OrgChartPersonNode({ data, selected }: NodeProps) {
  const nodeData = normalizeOrgChartNodeData(data);
  const initials = getInitials(nodeData.name);

  return (
    <div
      className={cn(
        "relative w-[228px] rounded-xl border-2 bg-card p-3 text-card-foreground shadow-sm transition-all duration-150",
        selected && "ring-2 ring-ring/55",
      )}
      style={{ borderColor: nodeData.accentColor }}
      role="group"
      aria-label={`${nodeData.name}, ${nodeData.role}`}
    >
      <Handle
        type="target"
        position={Position.Top}
        className="!h-2.5 !w-2.5 !border-2 !border-background !bg-foreground/70"
      />

      <div className="flex items-center gap-3">
        <Avatar className="size-11 border border-border/70">
          <AvatarImage src={nodeData.avatarUrl ?? undefined} alt={`Foto de ${nodeData.name}`} />
          <AvatarFallback className="text-xs font-semibold">{initials}</AvatarFallback>
        </Avatar>

        <div className="min-w-0">
          <p className="truncate text-sm font-semibold leading-tight">{nodeData.name}</p>
          <p className="truncate text-xs text-muted-foreground">{nodeData.role}</p>
        </div>
      </div>

      <Handle
        type="source"
        position={Position.Bottom}
        className="!h-2.5 !w-2.5 !border-2 !border-background !bg-foreground/70"
      />
    </div>
  );
}
