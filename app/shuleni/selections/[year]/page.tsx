/**
 * National Selections Summary Page - /shuleni/selections/[year]
 */

import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getNationalSummary, getTopCombinations, getTopIncomingSchools, getTopOutgoingSchools } from '@/lib/api';
import { formatNumber } from '@/lib/utils';

interface PageProps {
  params: Promise<{ year: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { year } = await params;
  
  return {
    title: `Tanzania National School Selections ${year} | Shuleni`,
    description: `Complete national overview of school selections in Tanzania for ${year}. View top combinations, schools with highest incoming/outgoing students, and nationwide education statistics.`,
    keywords: ['Tanzania school selections', `NECTA ${year}`, 'national education statistics', 'A-Level allocations', 'O-Level results'],
    openGraph: {
      title: `Tanzania National Selections ${year}`,
      description: `Nationwide school selection data for ${year}`,
      type: 'website',
    },
  };
}

export default async function NationalSelectionsPage({ params }: PageProps) {
  const { year } = await params;
  const yearNum = parseInt(year);
  
  const [summary, topCombs, topIncoming, topOutgoing] = await Promise.all([
    getNationalSummary(yearNum),
    getTopCombinations(yearNum),
    getTopIncomingSchools(yearNum),
    getTopOutgoingSchools(yearNum),
  ]);

  if (!summary) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Hero */}
      <header className="bg-gradient-to-r from-blue-600 to-indigo-700 dark:from-blue-800 dark:to-indigo-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl font-bold mb-4">Tanzania National Selections {year}</h1>
          <p className="text-xl opacity-90 mb-8">
            Comprehensive overview of student allocations across all regions
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
            <StatBox label="Total Outgoing" value={formatNumber(summary.total_outgoing)} />
            <StatBox label="Total Incoming" value={formatNumber(summary.total_incoming)} />
            <StatBox label="College Placements" value={formatNumber(summary.total_college)} />
            <StatBox label="Active Schools" value={formatNumber(summary.schools_count)} />
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Top Combinations */}
          <section className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">📊 Top Combinations Nationwide</h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="text-left py-3 px-4">Combination</th>
                    <th className="text-center py-3 px-4">Students</th>
                    <th className="text-center py-3 px-4">Male</th>
                    <th className="text-center py-3 px-4">Female</th>
                    <th className="text-center py-3 px-4">Schools</th>
                  </tr>
                </thead>
                <tbody>
                  {topCombs.map((comb, i) => (
                    <tr key={comb.id || i} className="border-b border-gray-100 dark:border-gray-800">
                      <td className="py-3 px-4">
                        <a href={`/shuleni/comb/${comb.comb_code.toLowerCase()}`} className="text-blue-600 hover:underline">
                          {comb.comb_code}
                        </a>
                      </td>
                      <td className="text-center font-semibold">{formatNumber(comb.total_students)}</td>
                      <td className="text-center">{formatNumber(comb.male_count)}</td>
                      <td className="text-center">{formatNumber(comb.female_count)}</td>
                      <td className="text-center">{formatNumber(comb.schools_count)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* Top Incoming Schools */}
          <section className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">🎓 Top Incoming Schools</h2>
            <div className="space-y-4">
              {topIncoming.slice(0, 10).map((school, i) => (
                <div key={school.id || i} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <div>
                    <a href={`/shuleni/school/${school.school?.slug}/selections/${year}`} className="font-medium text-blue-600 hover:underline block truncate">
                      {school.school?.name}
                    </a>
                    <div className="text-xs text-gray-500">
                      {school.school?.council?.region?.name}
                    </div>
                  </div>
                  <span className="font-bold text-lg">{formatNumber(school.total_incoming_alevel)}</span>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Top Outgoing Schools */}
        <section className="mt-8 bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">🏫 Top Outgoing Schools</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {topOutgoing.slice(0, 12).map((school, i) => (
              <div key={school.id || i} className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <a href={`/shuleni/school/${school.school?.slug}/selections/${year}`} className="font-medium text-blue-600 hover:underline block truncate mb-2">
                  {school.school?.name}
                </a>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {school.school?.council?.name}, {school.school?.council?.region?.name}
                </div>
                <div className="mt-2 text-2xl font-bold text-gray-900 dark:text-white">
                  {formatNumber(school.total_outgoing_olevel)}
                </div>
                <div className="text-xs text-gray-500">outgoing students</div>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}

function StatBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-white/10 backdrop-blur rounded-lg p-4">
      <div className="text-3xl font-bold mb-1">{value}</div>
      <div className="text-sm opacity-80">{label}</div>
    </div>
  );
}
