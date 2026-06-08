import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Merges Tailwind CSS classes consistently.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(dateStr: string) {
  const date = new Date(dateStr);
  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(date);
}

/** Sequelize DECIMAL renvoie souvent une chaîne */
export function toNumber(value: number | string): number {
  return typeof value === 'number' ? value : Number(value)
}

const categoryLabels: Record<string, string> = {
  raw_material: 'Matière première',
  component: 'Composant',
  consumable: 'Consommable',
  packaging: 'Emballage',
}

export function formatCategory(category: string): string {
  return categoryLabels[category] ?? category
}

export function formatDateTime(dateStr: string) {
  const date = new Date(dateStr);
  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}
