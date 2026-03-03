import { describe, test } from "node:test";
import assert from "node:assert/strict";

import {
  buildOrgChartPath,
  groupOrgChartPagesByCity,
  normalizeOrgChartSegment,
} from "@/lib/org-chart-navigation";

describe("org chart navigation helpers", () => {
  test("normalizes labels into stable URL segments", () => {
    assert.equal(
      normalizeOrgChartSegment("  São Paulo / Centro  "),
      "sao-paulo-centro",
    );
    assert.equal(
      normalizeOrgChartSegment("P&D - Inovação"),
      "pd-inovacao",
    );
    assert.equal(normalizeOrgChartSegment(""), "geral");
  });

  test("builds the expected org chart path", () => {
    assert.equal(
      buildOrgChartPath({
        organizationSlug: "empresa-x",
        citySlug: "sao-paulo",
        sectorSlug: "financeiro",
      }),
      "/org/empresa-x/organograma/sao-paulo/financeiro",
    );
  });

  test("groups pages by city and sorts sectors by label", () => {
    const grouped = groupOrgChartPagesByCity([
      {
        chartId: "1",
        city: "Campinas",
        citySlug: "campinas",
        sector: "RH",
        sectorSlug: "rh",
      },
      {
        chartId: "2",
        city: "Campinas",
        citySlug: "campinas",
        sector: "Financeiro",
        sectorSlug: "financeiro",
      },
      {
        chartId: "3",
        city: "São Paulo",
        citySlug: "sao-paulo",
        sector: "Operações",
        sectorSlug: "operacoes",
      },
    ]);

    assert.deepEqual(grouped.map((city) => city.city), ["Campinas", "São Paulo"]);
    assert.deepEqual(grouped[0].sectors.map((sector) => sector.sector), [
      "Financeiro",
      "RH",
    ]);
  });
});
