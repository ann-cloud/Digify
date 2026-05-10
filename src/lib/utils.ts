export function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 80);
}

export function formatPrice(value: number | string): string {
  const n = typeof value === 'string' ? parseFloat(value) : value;
  return `$${n.toFixed(2)}`;
}
