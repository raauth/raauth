-- CreateTable
CREATE TABLE "organization_chart" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "createdById" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "citySlug" TEXT NOT NULL,
    "sector" TEXT NOT NULL,
    "sectorSlug" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "organization_chart_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "organization_chart_node" (
    "id" TEXT NOT NULL,
    "chartId" TEXT NOT NULL,
    "nodeId" TEXT NOT NULL,
    "type" TEXT,
    "positionX" DOUBLE PRECISION NOT NULL,
    "positionY" DOUBLE PRECISION NOT NULL,
    "data" JSONB NOT NULL,
    "width" DOUBLE PRECISION,
    "height" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "organization_chart_node_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "organization_chart_edge" (
    "id" TEXT NOT NULL,
    "chartId" TEXT NOT NULL,
    "edgeId" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "target" TEXT NOT NULL,
    "sourceHandle" TEXT,
    "targetHandle" TEXT,
    "type" TEXT,
    "label" TEXT,
    "animated" BOOLEAN NOT NULL DEFAULT false,
    "data" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "organization_chart_edge_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "organization_chart_organizationId_citySlug_sectorSlug_idx" ON "organization_chart"("organizationId", "citySlug", "sectorSlug");

-- CreateIndex
CREATE UNIQUE INDEX "organization_chart_organizationId_citySlug_sectorSlug_key" ON "organization_chart"("organizationId", "citySlug", "sectorSlug");

-- CreateIndex
CREATE INDEX "organization_chart_node_chartId_idx" ON "organization_chart_node"("chartId");

-- CreateIndex
CREATE UNIQUE INDEX "organization_chart_node_chartId_nodeId_key" ON "organization_chart_node"("chartId", "nodeId");

-- CreateIndex
CREATE INDEX "organization_chart_edge_chartId_idx" ON "organization_chart_edge"("chartId");

-- CreateIndex
CREATE UNIQUE INDEX "organization_chart_edge_chartId_edgeId_key" ON "organization_chart_edge"("chartId", "edgeId");

-- AddForeignKey
ALTER TABLE "organization_chart" ADD CONSTRAINT "organization_chart_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "organization_chart" ADD CONSTRAINT "organization_chart_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "organization_chart_node" ADD CONSTRAINT "organization_chart_node_chartId_fkey" FOREIGN KEY ("chartId") REFERENCES "organization_chart"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "organization_chart_edge" ADD CONSTRAINT "organization_chart_edge_chartId_fkey" FOREIGN KEY ("chartId") REFERENCES "organization_chart"("id") ON DELETE CASCADE ON UPDATE CASCADE;
