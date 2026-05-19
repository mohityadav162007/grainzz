export interface PackageItem {
  package_length?: number | null;
  package_breadth?: number | null;
  package_height?: number | null;
  package_weight?: number | null;
  quantity: number;
}

export interface CalculatedPackage {
  length: number;
  breadth: number;
  height: number;
  weight: number;
  volumetric_weight: number;
  applicable_weight: number;
}

/**
 * Calculates the aggregated package dimensions and weight for an order.
 * 
 * Aggregation logic:
 * - Weight: Summed (weight * quantity)
 * - Height: Summed (height * quantity)
 * - Length: Maximum of all items
 * - Breadth: Maximum of all items
 * 
 * Default Fallbacks:
 * - Length: 15 cm
 * - Breadth: 15 cm
 * - Height: 10 cm
 * - Weight: 0.5 kg
 */
export function calculateAggregatedPackage(items: PackageItem[]): CalculatedPackage {
  let totalWeight = 0;
  let finalLength = 0;
  let finalBreadth = 0;
  let finalHeight = 0;

  for (const item of items) {
    let length = Number(item.package_length);
    if (isNaN(length) || length <= 0) length = 15;

    let breadth = Number(item.package_breadth);
    if (isNaN(breadth) || breadth <= 0) breadth = 15;

    let height = Number(item.package_height);
    if (isNaN(height) || height <= 0) height = 10;

    let weight = Number(item.package_weight);
    if (isNaN(weight) || weight <= 0) weight = 0.5;

    const qty = Number(item.quantity) || 1;

    totalWeight += weight * qty;
    finalLength = Math.max(finalLength, length);
    finalBreadth = Math.max(finalBreadth, breadth);
    finalHeight += height * qty;
  }

  // Handle empty list or minimum limits
  if (items.length === 0) {
    finalLength = 15;
    finalBreadth = 15;
    finalHeight = 10;
    totalWeight = 0.5;
  } else {
    finalLength = Math.max(finalLength, 1);
    finalBreadth = Math.max(finalBreadth, 1);
    finalHeight = Math.max(finalHeight, 1);
    totalWeight = Math.max(totalWeight, 0.1);
  }

  const volumetricWeight = (finalLength * finalBreadth * finalHeight) / 5000;
  const applicableWeight = Math.max(totalWeight, volumetricWeight);

  return {
    length: finalLength,
    breadth: finalBreadth,
    height: finalHeight,
    weight: totalWeight,
    volumetric_weight: Number(volumetricWeight.toFixed(4)),
    applicable_weight: Number(applicableWeight.toFixed(4)),
  };
}
