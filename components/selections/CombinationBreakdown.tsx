import Link from 'next/link';
import { formatNumber, getGenderSplit } from '@/lib/utils';
import type { SchoolCombStats, SchoolFlowStats } from '@/types';

interface CombinationBreakdownProps {
  combStats: SchoolCombStats[];
  year: number;
}

export function CombinationBreakdown({ combStats, year }: CombinationBreakdownProps) {
  // Group by combination code
  const grouped = combStats.reduce((acc, stat) => {
    if (!acc[stat.comb_code]) {
      acc[stat.comb_code] = { total: 0, female: 0, male: 0, destinations: [] as any[] };
    }
    acc[stat.comb_code].total += stat.student_count;
    acc[stat.comb_code].female += stat.female_count;
    acc[stat.comb_code].male += stat.male_count;
    acc[stat.comb_code].destinations.push({
      schoolName: stat.destination_school?.school_name || 'Unknown',
      schoolSlug: stat.destination_school?.slug || '',
      count: stat.student_count,
      female: stat.female_count,
      male: stat.male_count,
    });
    return acc;
  }, {} as Record<string, any>);

  // Sort by total descending
  const sortedCombs = Object.entries(grouped)
    .sort((a, b) => b[1].total - a[1].total);

  if (sortedCombs.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        Hakuna data ya mchanganyiko kwa mwaka huu
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {sortedCombs.map(([combCode, data]) => (
        <div key={combCode} className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between mb-3">
            <Link 
              href={`/mchanganyiko/${combCode.toLowerCase()}`}
              className="text-xl font-bold text-blue-600 hover:text-blue-700"
            >
              {combCode}
            </Link>
            <div className="text-right">
              <div className="text-lg font-semibold text-gray-900">
                {formatNumber(data.total)} wanafunzi
              </div>
              <div className="text-sm text-gray-500">
                {getGenderSplit(data.female, data.male)}
              </div>
            </div>
          </div>

          <div className="border-t border-gray-100 pt-3">
            <h4 className="text-sm font-medium text-gray-700 mb-2">
              Shule walizochaguliwa:
            </h4>
            <ul className="space-y-2">
              {data.destinations
                .sort((a: any, b: any) => b.count - a.count)
                .map((dest: any, idx: number) => (
                  <li key={idx} className="flex items-center justify-between text-sm">
                    <Link
                      href={`/shule/${dest.schoolSlug}`}
                      className="text-gray-700 hover:text-blue-600 truncate flex-1"
                    >
                      {dest.schoolName}
                    </Link>
                    <span className="text-gray-900 font-medium ml-4">
                      {formatNumber(dest.count)}
                    </span>
                  </li>
                ))}
            </ul>
          </div>
        </div>
      ))}
    </div>
  );
}

interface FlowListProps {
  flows: SchoolFlowStats[];
  direction: 'origin' | 'destination';
  limit?: number;
}

export function FlowList({ flows, direction, limit = 10 }: FlowListProps) {
  const sorted = [...flows]
    .sort((a, b) => b.student_count - a.student_count)
    .slice(0, limit);

  if (sorted.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        Hakuna data ya mtiririko kwa mwaka huu
      </div>
    );
  }

  const isOrigin = direction === 'origin';

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <table className="w-full">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              {isOrigin ? 'Shule ya Kusudi' : 'Shule ya Asili'}
            </th>
            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
              Wanafunzi
            </th>
            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
              Jinsia
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {sorted.map((flow) => {
            const school = isOrigin ? flow.destination_school : flow.origin_school;
            return (
              <tr key={flow.id} className="hover:bg-gray-50">
                <td className="px-4 py-3">
                  <Link
                    href={`/shule/${school?.slug || ''}`}
                    className="text-gray-900 hover:text-blue-600 font-medium"
                  >
                    {school?.school_name || 'Unknown'}
                  </Link>
                </td>
                <td className="px-4 py-3 text-right">
                  <span className="font-semibold text-gray-900">
                    {formatNumber(flow.student_count)}
                  </span>
                </td>
                <td className="px-4 py-3 text-right text-sm text-gray-500">
                  {getGenderSplit(flow.female_count, flow.male_count)}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
