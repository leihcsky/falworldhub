export function formatDexNumber(dexNumber: number, dexSuffix?: string): string {
  if (!dexNumber || dexNumber < 0) return "#???";
  const base = `#${String(dexNumber).padStart(3, "0")}`;
  return dexSuffix ? `${base}${dexSuffix}` : base;
}
