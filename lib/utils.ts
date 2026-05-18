/**
 * Utility functions for ShuleYetu
 */

import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatNumber(num: number): string {
  return new Intl.NumberFormat('en-TZ').format(num);
}

export function formatPercentage(value: number, total: number): string {
  if (total === 0) return '0%';
  return `${((value / total) * 100).toFixed(1)}%`;
}

export function getGenderSplit(female: number, male: number): string {
  const total = female + male;
  if (total === 0) return 'N/A';
  const femalePct = ((female / total) * 100).toFixed(0);
  return `F: ${femalePct}% | M: ${100 - parseInt(femalePct)}%`;
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function unslugify(slug: string): string {
  return slug
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

// Geographic scope labels (Swahili terms as per blueprint)
export const SCOPE_LABELS = {
  ward: 'Ndani ya Kata',
  council: 'Ndani ya Halmashauri',
  regional: 'Ndani ya Mkoa',
  outsideRegion: 'Nje ya Mkoa',
};

// Boarding status labels
export const ACCOMMODATION_LABELS = {
  BOARDING: 'Bweni',
  DAY: 'Kutwa',
  'BOARDING AND DAY': 'Bweni na Kutwa',
  BWENI: 'Bweni',
  KUTWA: 'Kutwa',
};

// School type labels
export const SCHOOL_TYPE_LABELS = {
  GOVERNMENT: 'Serikali',
  PRIVATE: 'Binafsi',
  UNKNOWN: 'Haijulikani',
};

// Exam type display names
export const EXAM_TYPE_LABELS: Record<string, string> = {
  CSEE: 'CSEE (O-Level)',
  ACSEE: 'ACSEE (A-Level)',
  PSLE: 'PSLE (Primary)',
  GATSCCE: 'GATSCCE (Vocational)',
  GATCE: 'GATCE (Advanced Vocational)',
};

// Gender badges
export function getGenderBadge(isGirls: boolean, isBoys: boolean, isMixture: boolean): string {
  if (isGirls) return 'Wasichana';
  if (isBoys) return 'Wavulana';
  if (isMixture) return 'Mchanganyiko';
  return 'Mchanganyiko';
}

// Calculate derived outside-region count
export function calculateOutsideRegion(
  alevel: number,
  ward: number,
  council: number,
  regional: number
): number {
  return Math.max(0, alevel - ward - council - regional);
}

// Calculate boarding rate
export function calculateBoardingRate(boarding: number, day: number): number {
  const total = boarding + day;
  if (total === 0) return 0;
  return (boarding / total) * 100;
}

// Year range generator
export function getYearRange(start: number, end: number): number[] {
  const years: number[] = [];
  for (let y = start; y <= end; y++) {
    years.push(y);
  }
  return years;
}

// Pagination helper
export function getPageRange(current: number, total: number, delta = 2): (number | string)[] {
  const range: (number | string)[] = [];
  const left = Math.max(1, current - delta);
  const right = Math.min(total, current + delta);

  if (left > 1) {
    range.push(1);
    if (left > 2) range.push('...');
  }

  for (let i = left; i <= right; i++) {
    range.push(i);
  }

  if (right < total) {
    if (right < total - 1) range.push('...');
    range.push(total);
  }

  return range;
}
