import Link from 'next/link';
import type { YearSelectorProps } from '@/types';

export function YearSelector({ currentYear, availableYears, baseUrl }: YearSelectorProps) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-gray-500">Mwaka:</span>
      <div className="flex gap-1">
        {availableYears.map((year) => (
          <Link
            key={year}
            href={`${baseUrl}/${year}`}
            className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
              year === currentYear
                ? 'bg-blue-600 text-white font-medium'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {year}
          </Link>
        ))}
      </div>
    </div>
  );
}
