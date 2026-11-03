export function parseMeasurement(raw: string): number | null {
  const value = raw.trim();
  if (/^[+-]?(?:\d+(?:\.\d*)?|\.\d+)$/.test(value)) {
    const n = Number(value);
    return Number.isFinite(n) ? n : null;
  }
  const mixed = value.match(/^([+-]?)(?:(\d+)[\s-]+)?(\d+)\s*\/\s*(\d+)$/);
  if (!mixed) return null;
  const denominator = Number(mixed[4]);
  if (denominator === 0) return null;
  const result =
    (Number(mixed[2] ?? 0) + Number(mixed[3]) / denominator) *
    (mixed[1] === "-" ? -1 : 1);
  return Number.isFinite(result) ? result : null;
}
