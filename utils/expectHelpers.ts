export function recomputeCartTotals(products: Array<{ price: number; quantity: number; discountPercentage?: number }>) {
  let total = 0;
  let discountedTotal = 0;
  let totalQuantity = 0;
  const totalProducts = products.length;

  for (const p of products) {
    const line = p.price * p.quantity;
    total += line;
    const discount = p.discountPercentage ? line * (p.discountPercentage / 100) : 0;
    discountedTotal += Math.round((line - discount) * 100) / 100;
    totalQuantity += p.quantity;
  }
  return { total, discountedTotal, totalProducts, totalQuantity };
}
