export function formatPriceAsInteger(
  value: string | number | null | undefined
): string {
  if (value === null || value === undefined || value === "") {
    return "";
  }

  const numericValue = Number(value);

  if (!Number.isFinite(numericValue)) {
    return "";
  }

  return String(Math.trunc(numericValue));
}
