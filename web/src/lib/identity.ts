/**
 * Visual identity helpers. Colors are derived from the address/name,
 * so a site published tomorrow gets a stable tile without anyone picking one.
 */
const TILE_PALETTE = ["#0E7C70", "#B45309", "#4D7C0F", "#0369A1", "#6D28D9", "#BE185D", "#1D4ED8", "#9A3412"] as const;

const AVATAR_PALETTE = [
  { bg: "#FDE7D8", fg: "#9A3412" },
  { bg: "#DBEAFE", fg: "#1E40AF" },
  { bg: "#DCFCE7", fg: "#166534" },
  { bg: "#F3E8FF", fg: "#6B21A8" },
  { bg: "#FEF3C7", fg: "#92400E" },
] as const;

function hash(input: string): number {
  let h = 0;
  for (const ch of input) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return h;
}

export function tileColor(address: string): string {
  return TILE_PALETTE[hash(address) % TILE_PALETTE.length]!;
}

export function tileLetter(titleOrAddress: string): string {
  const first = titleOrAddress.replace(/^the\s+/i, "").trim()[0];
  return first ? first.toUpperCase() : "?";
}

export function avatarColors(id: string) {
  return AVATAR_PALETTE[hash(id) % AVATAR_PALETTE.length]!;
}

export function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]!.toUpperCase())
    .join("");
}
