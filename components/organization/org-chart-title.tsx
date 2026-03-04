import { ChevronRight } from "lucide-react";

import { cn } from "@/lib/utils";

interface OrgChartTitleProps {
  city: string;
  sector: string;
  compact?: boolean;
  className?: string;
}

export function OrgChartTitle({
  city,
  sector,
  compact = false,
  className,
}: OrgChartTitleProps) {
  return (
    <div
      className={cn(
        "flex min-w-0 flex-wrap items-center gap-1.5 text-muted-foreground",
        compact ? "text-sm" : "text-base",
        className,
      )}
      aria-label={`Organograma, cidade ${city}, setor ${sector}`}
    >
      <span className="font-medium text-foreground">Organograma</span>
      <ChevronRight className="size-4 shrink-0" />
      <span className="truncate">{city}</span>
      <ChevronRight className="size-4 shrink-0" />
      <span className="truncate text-foreground">{sector}</span>
    </div>
  );
}
