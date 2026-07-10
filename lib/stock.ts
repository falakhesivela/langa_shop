/** Variant stock keys match the backend: `SIZE|color` (color may be empty). */

export function variantStockKey(size: string, color = ""): string {
  return `${size}|${(color || "").trim().toLowerCase()}`;
}

export function getVariantStock(
  variantStock: Record<string, number> | undefined,
  productStock: number,
  size: string,
  color = "",
): number {
  if (!variantStock || Object.keys(variantStock).length === 0) {
    return Math.max(0, productStock);
  }
  return Math.max(0, variantStock[variantStockKey(size, color)] ?? 0);
}

export function totalVariantStock(
  variantStock: Record<string, number> | undefined,
  productStock: number,
): number {
  if (!variantStock || Object.keys(variantStock).length === 0) {
    return Math.max(0, productStock);
  }
  return Math.max(
    0,
    Object.values(variantStock).reduce((sum, qty) => sum + Math.max(0, qty), 0),
  );
}

export function buildVariantCombos(
  sizes: string[],
  colors: string[],
): Array<{ size: string; color: string; key: string }> {
  const sizeList = sizes.length > 0 ? sizes : ["One Size"];
  const colorList = colors.length > 0 ? colors : [""];
  return sizeList.flatMap((size) =>
    colorList.map((color) => ({
      size,
      color,
      key: variantStockKey(size, color),
    })),
  );
}
