const HEX_COLOR_REGEX = /^#(?:[0-9A-Fa-f]{6})$/;

const DEFAULT_NODE_NAME = "Nova posicao";
const DEFAULT_NODE_ROLE = "Cargo";
const DEFAULT_NODE_ACCENT_COLOR = "#3b82f6";

export interface OrgChartNodeData extends Record<string, unknown> {
  label: string;
  name: string;
  role: string;
  avatarUrl: string | null;
  accentColor: string;
}

export const ORG_CHART_NODE_TYPE = "orgPersonNode";

interface OrgChartNodeDefaults {
  name?: string;
  role?: string;
  accentColor?: string;
}

function sanitizeText(value: unknown, fallback = "") {
  return typeof value === "string" && value.trim().length > 0
    ? value.trim()
    : fallback;
}

function sanitizeAccentColor(value: unknown, fallback = DEFAULT_NODE_ACCENT_COLOR) {
  const candidate = typeof value === "string" ? value.trim() : "";
  return HEX_COLOR_REGEX.test(candidate) ? candidate : fallback;
}

function sanitizeAvatar(value: unknown) {
  const candidate = typeof value === "string" ? value.trim() : "";
  return candidate.length > 0 ? candidate : null;
}

export function normalizeOrgChartNodeData(
  value: unknown,
  defaults: OrgChartNodeDefaults = {},
): OrgChartNodeData {
  const source =
    typeof value === "object" && value !== null && !Array.isArray(value)
      ? (value as Record<string, unknown>)
      : {};

  const fallbackName = defaults.name?.trim() || DEFAULT_NODE_NAME;
  const fallbackRole = defaults.role?.trim() || DEFAULT_NODE_ROLE;
  const fallbackAccent = defaults.accentColor?.trim() || DEFAULT_NODE_ACCENT_COLOR;

  const name = sanitizeText(source.name, sanitizeText(source.label, fallbackName));
  const role = sanitizeText(source.role, fallbackRole);
  const label = sanitizeText(source.label, name);
  const avatarUrl = sanitizeAvatar(source.avatarUrl);
  const accentColor = sanitizeAccentColor(source.accentColor, fallbackAccent);

  return {
    ...source,
    label,
    name,
    role,
    avatarUrl,
    accentColor,
  };
}

export function createOrgChartNodeData(
  overrides: Partial<OrgChartNodeData> = {},
): OrgChartNodeData {
  return normalizeOrgChartNodeData(overrides, {
    name: DEFAULT_NODE_NAME,
    role: DEFAULT_NODE_ROLE,
    accentColor: DEFAULT_NODE_ACCENT_COLOR,
  });
}
