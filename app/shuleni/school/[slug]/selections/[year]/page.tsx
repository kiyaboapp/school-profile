/**
 * School Selections Page - /shuleni/school/[slug]/selections/[year]
 * Comprehensive, SEO-optimized page displaying school selection data
 */

import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getSchoolSelections } from '@/lib/api';
import { formatNumber, formatPercentage, calculateRetentionRate } from '@/lib/utils';

interface PageProps {
  params: Promise<{ slug: string; year: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug, year } = await params;
  
  // Fetch minimal data for metadata
  const data = await getSchoolSelections(slug, parseInt(year));
  
  const schoolName = data?.school?.name || slug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  
  return {
    title: `${schoolName} Selections ${year} | Shuleni - Complete Student Allocation Data`,
    description: `Comprehensive selections data for ${schoolName} in ${year}. View outgoing O-Level students (${formatNumber(data?.total_outgoing_olevel || 0)}), incoming A-Level students (${formatNumber(data?.total_incoming_alevel || 0)}), geographic distribution, combination breakdowns, and school-to-school flows.`,
    keywords: [`${schoolName} selections`, `${schoolName} ${year}`, 'O-Level results', 'A-Level allocations', 'Tanzania education', 'NECTA selections', 'school statistics'],
    openGraph: {
      title: `${schoolName} Selections ${year}`,
      description: `Complete student allocation data for ${schoolName} - ${formatNumber(data?.total_outgoing_olevel || 0)} outgoing students, ${formatNumber(data?.total_incoming_alevel || 0)} incoming students`,
      type: 'website',
      locale: 'en_TZ',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${schoolName} Selections ${year}`,
      description: `View complete selections data including geographic scope, combinations, and student flows`,
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
  };
}

export default async function SchoolSelectionsPage({ params }: PageProps) {
  const { slug, year } = await params;
  const yearNum = parseInt(year);
  
  const data = await getSchoolSelections(slug, yearNum);
  
  if (!data) {
    notFound();
  }

  const schoolName = data.school?.name || slug;
  const wardName = data.school?.ward?.name;
  const councilName = data.school?.council?.name;
  const regionName = data.school?.council?.region?.name;
  
  // Calculate derived metrics
  const totalStudents = (data.total_outgoing_olevel || 0) + (data.total_incoming_alevel || 0) + (data.total_college_students || 0);
  const malePercentage = data.male_outgoing && data.total_outgoing_olevel 
    ? ((data.male_outgoing / data.total_outgoing_olevel) * 100).toFixed(1) 
    : '0';
  const femalePercentage = data.female_outgoing && data.total_outgoing_olevel 
    ? ((data.female_outgoing / data.total_outgoing_olevel) * 100).toFixed(1) 
    : '0';
  const boardingPercentage = data.outgoing_boarding && data.total_outgoing_olevel 
    ? ((data.outgoing_boarding / data.total_outgoing_olevel) * 100).toFixed(1) 
    : '0';
  const dayPercentage = data.outgoing_day && data.total_outgoing_olevel 
    ? ((data.outgoing_day / data.total_outgoing_olevel) * 100).toFixed(1) 
    : '0';
    
  // Geographic scope calculations
  const outsideWard = data.outgoing_ward_scope || 0;
  const outsideCouncil = data.outgoing_council_scope || 0;
  const outsideRegion = data.outgoing_regional_scope || 0;
  const retainedInWard = Math.max(0, (data.total_outgoing_olevel || 0) - outsideWard);
  const retainedInCouncil = Math.max(0, outsideWard - outsideCouncil);
  const retainedInRegion = Math.max(0, outsideCouncil - outsideRegion);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Hero Section */}
      <header className="bg-gradient-to-r from-blue-600 to-indigo-700 dark:from-blue-800 dark:to-indigo-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex items-start justify-between">
            <div>
              <nav className="text-sm mb-4 opacity-80">
                <ol className="flex items-center space-x-2">
                  <li><a href="/shuleni/selections" className="hover:underline">Home</a></li>
                  <li>/</li>
                  <li><a href={`/shuleni/region/${regionName?.toLowerCase().replace(/\s+/g, '-')}/selections/${year}`} className="hover:underline">{regionName}</a></li>
                  <li>/</li>
                  <li><a href={`/shuleni/council/${councilName?.toLowerCase().replace(/\s+/g, '-')}/selections/${year}`} className="hover:underline">{councilName}</a></li>
                  <li>/</li>
                  <li className="font-semibold">{schoolName}</li>
                </ol>
              </nav>
              
              <h1 className="text-4xl md:text-5xl font-bold mb-2">{schoolName}</h1>
              <p className="text-xl opacity-90 mb-4">
                {wardName}, {councilName}, {regionName}
              </p>
              <div className="flex items-center space-x-4 text-lg">
                <span className="bg-white/20 px-4 py-2 rounded-full">{year} Selections</span>
                <span className="bg-white/20 px-4 py-2 rounded-full">
                  {formatNumber(totalStudents)} Total Students
                </span>
              </div>
            </div>
            
            <div className="hidden md:block text-right">
              <div className="text-3xl font-bold">{formatNumber(data.total_outgoing_olevel || 0)}</div>
              <div className="text-sm opacity-80">Outgoing O-Level</div>
              <div className="text-3xl font-bold mt-2">{formatNumber(data.total_incoming_alevel || 0)}</div>
              <div className="text-sm opacity-80">Incoming A-Level</div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <StatCard 
            label="Outgoing O-Level" 
            value={formatNumber(data.total_outgoing_olevel || 0)}
            trend={data.male_outgoing ? `${formatNumber(data.male_outgoing)}M / ${formatNumber(data.female_outgoing)}F` : undefined}
            icon="🎓"
          />
          <StatCard 
            label="Incoming A-Level" 
            value={formatNumber(data.total_incoming_alevel || 0)}
            trend={data.male_incoming ? `${formatNumber(data.male_incoming)}M / ${formatNumber(data.female_incoming)}F` : undefined}
            icon="📚"
          />
          <StatCard 
            label="College Students" 
            value={formatNumber(data.total_college_students || 0)}
            icon="🏫"
          />
          <StatCard 
            label="Total Placements" 
            value={formatNumber(totalStudents)}
            icon="✨"
          />
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Gender Distribution */}
            <section className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
                <span className="mr-3">👥</span>
                Gender Distribution (Outgoing)
              </h2>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-700 dark:text-gray-300">Male</span>
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {formatNumber(data.male_outgoing || 0)} ({malePercentage}%)
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                    <div 
                      className="bg-blue-600 h-3 rounded-full transition-all duration-500"
                      style={{ width: `${malePercentage}%` }}
                    />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-700 dark:text-gray-300">Female</span>
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {formatNumber(data.female_outgoing || 0)} ({femalePercentage}%)
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                    <div 
                      className="bg-pink-600 h-3 rounded-full transition-all duration-500"
                      style={{ width: `${femalePercentage}%` }}
                    />
                  </div>
                </div>
              </div>
            </section>

            {/* Boarding vs Day */}
            <section className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
                <span className="mr-3">🏠</span>
                Boarding vs Day Students
              </h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                    {formatNumber(data.outgoing_boarding || 0)}
                  </div>
                  <div className="text-gray-600 dark:text-gray-400 mt-1">Boarding</div>
                  <div className="text-sm text-gray-500 dark:text-gray-500 mt-1">{boardingPercentage}%</div>
                </div>
                <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <div className="text-3xl font-bold text-green-600 dark:text-green-400">
                    {formatNumber(data.outgoing_day || 0)}
                  </div>
                  <div className="text-gray-600 dark:text-gray-400 mt-1">Day</div>
                  <div className="text-sm text-gray-500 dark:text-gray-500 mt-1">{dayPercentage}%</div>
                </div>
              </div>
            </section>

            {/* Combination Breakdown */}
            {data.comb_breakdown && data.comb_breakdown.length > 0 && (
              <section className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
                  <span className="mr-3">📊</span>
                  Combination Breakdown
                </h2>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200 dark:border-gray-700">
                        <th className="text-left py-3 px-4 text-gray-700 dark:text-gray-300 font-semibold">Combination</th>
                        <th className="text-center py-3 px-4 text-gray-700 dark:text-gray-300 font-semibold">Students</th>
                        <th className="text-center py-3 px-4 text-gray-700 dark:text-gray-300 font-semibold">Male</th>
                        <th className="text-center py-3 px-4 text-gray-700 dark:text-gray-300 font-semibold">Female</th>
                        <th className="text-center py-3 px-4 text-gray-700 dark:text-gray-300 font-semibold">Type</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.comb_breakdown.map((comb, index) => (
                        <tr 
                          key={comb.id || index}
                          className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700/50"
                        >
                          <td className="py-3 px-4">
                            <a 
                              href={`/shuleni/comb/${comb.combination?.slug || comb.comb_code.toLowerCase()}`}
                              className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
                            >
                              {comb.combination?.name || comb.comb_code}
                            </a>
                            {comb.combination?.subjects && (
                              <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                {comb.combination.subjects.join(', ')}
                              </div>
                            )}
                          </td>
                          <td className="text-center py-3 px-4 font-semibold text-gray-900 dark:text-white">
                            {formatNumber(comb.students_count || 0)}
                          </td>
                          <td className="text-center py-3 px-4 text-gray-600 dark:text-gray-400">
                            {formatNumber(comb.male_count || 0)}
                          </td>
                          <td className="text-center py-3 px-4 text-gray-600 dark:text-gray-400">
                            {formatNumber(comb.female_count || 0)}
                          </td>
                          <td className="text-center py-3 px-4">
                            <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                              comb.is_destination 
                                ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                                : 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
                            }`}>
                              {comb.is_destination ? 'Destination' : 'Feeder'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            )}

            {/* Flow Statistics */}
            {data.flow_stats && data.flow_stats.length > 0 && (
              <section className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
                  <span className="mr-3">🔄</span>
                  School Flows
                </h2>
                <div className="space-y-4">
                  {data.flow_stats.slice(0, 10).map((flow, index) => (
                    <div 
                      key={flow.id || index}
                      className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
                    >
                      <div className="flex items-center space-x-4 flex-1">
                        <div className="flex-shrink-0 w-32">
                          <a 
                            href={`/shuleni/school/${flow.origin_school?.slug}/selections/${year}`}
                            className="text-sm text-blue-600 dark:text-blue-400 hover:underline block truncate"
                          >
                            {flow.origin_school?.name}
                          </a>
                        </div>
                        <div className="flex-shrink-0 text-gray-400">→</div>
                        <div className="flex-1 min-w-0">
                          <a 
                            href={`/shuleni/school/${flow.destination_school?.slug}/selections/${year}`}
                            className="text-sm text-blue-600 dark:text-blue-400 hover:underline block truncate font-medium"
                          >
                            {flow.destination_school?.name}
                          </a>
                        </div>
                      </div>
                      <div className="flex-shrink-0 ml-4">
                        <span className="inline-block bg-indigo-100 dark:bg-indigo-900/30 text-indigo-800 dark:text-indigo-400 px-3 py-1 rounded-full text-sm font-semibold">
                          {formatNumber(flow.students_count || 0)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>

          {/* Sidebar */}
          <aside className="space-y-6">
            {/* Geographic Scope */}
            <section className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 sticky top-4">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center">
                <span className="mr-2">🗺️</span>
                Geographic Distribution
              </h3>
              <div className="space-y-4">
                <GeoScopeItem 
                  label="Within Ward"
                  value={formatNumber(retainedInWard)}
                  percentage={data.total_outgoing_olevel ? (retainedInWard / data.total_outgoing_olevel * 100).toFixed(1) : '0'}
                  color="green"
                />
                <GeoScopeItem 
                  label="Outside Ward (Council)"
                  value={formatNumber(retainedInCouncil)}
                  percentage={data.total_outgoing_olevel ? (retainedInCouncil / data.total_outgoing_olevel * 100).toFixed(1) : '0'}
                  color="blue"
                />
                <GeoScopeItem 
                  label="Outside Council (Region)"
                  value={formatNumber(retainedInRegion)}
                  percentage={data.total_outgoing_olevel ? (retainedInRegion / data.total_outgoing_olevel * 100).toFixed(1) : '0'}
                  color="purple"
                />
                <GeoScopeItem 
                  label="Outside Region"
                  value={formatNumber(outsideRegion)}
                  percentage={data.total_outgoing_olevel ? (outsideRegion / data.total_outgoing_olevel * 100).toFixed(1) : '0'}
                  color="orange"
                />
              </div>
              
              <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Understanding Geographic Scope</h4>
                <ul className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
                  <li>• <strong>Within Ward:</strong> Students placed in schools within the same ward</li>
                  <li>• <strong>Outside Ward:</strong> Students placed in other wards within the council</li>
                  <li>• <strong>Outside Council:</strong> Students placed in other councils within the region</li>
                  <li>• <strong>Outside Region:</strong> Students placed in different regions</li>
                </ul>
              </div>
            </section>

            {/* Quick Stats */}
            <section className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl shadow-lg p-6 text-white">
              <h3 className="text-lg font-bold mb-4">Quick Insights</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="opacity-90">Total Outgoing</span>
                  <span className="font-bold text-lg">{formatNumber(data.total_outgoing_olevel || 0)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="opacity-90">Total Incoming</span>
                  <span className="font-bold text-lg">{formatNumber(data.total_incoming_alevel || 0)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="opacity-90">College Placements</span>
                  <span className="font-bold text-lg">{formatNumber(data.total_college_students || 0)}</span>
                </div>
                <div className="pt-3 border-t border-white/20">
                  <div className="flex justify-between items-center">
                    <span className="opacity-90">Gender Ratio (M:F)</span>
                    <span className="font-bold">{malePercentage}:{femalePercentage}</span>
                  </div>
                </div>
              </div>
            </section>
          </aside>
        </div>

        {/* SEO Content Footer */}
        <footer className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700">
          <div className="prose dark:prose-invert max-w-none">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              About {schoolName} Selections Data
            </h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              This page provides comprehensive selections data for {schoolName} for the year {year}. 
              The data includes {formatNumber(data.total_outgoing_olevel || 0)} outgoing O-Level students who were allocated to various A-Level schools and colleges, 
              as well as {formatNumber(data.total_incoming_alevel || 0)} incoming A-Level students who chose this school for their advanced studies.
            </p>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed mt-4">
              Geographic distribution shows how many students were placed within the local ward ({formatNumber(retainedInWard)}), 
              outside the ward but within the council ({formatNumber(retainedInCouncil)}), 
              outside the council but within the region ({formatNumber(retainedInRegion)}), 
              and outside the region entirely ({formatNumber(outsideRegion)}).
            </p>
            <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <h3 className="font-semibold text-blue-900 dark:text-blue-300 mb-2">Data Source</h3>
              <p className="text-sm text-blue-800 dark:text-blue-400">
                All selection data is sourced from official NECTA (National Examinations Council of Tanzania) records and verified through the Ministry of Education. 
                Data is updated annually following the release of Form Four and Form Six examination results.
              </p>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}

// Sub-components
function StatCard({ label, value, trend, icon }: { label: string; value: string; trend?: string; icon: string }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
      <div className="flex items-center justify-between mb-2">
        <span className="text-2xl">{icon}</span>
        <span className="text-3xl font-bold text-gray-900 dark:text-white">{value}</span>
      </div>
      <div className="text-gray-600 dark:text-gray-400 text-sm">{label}</div>
      {trend && <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">{trend}</div>}
    </div>
  );
}

function GeoScopeItem({ label, value, percentage, color }: { label: string; value: string; percentage: string; color: string }) {
  const colorClasses = {
    green: 'bg-green-600',
    blue: 'bg-blue-600',
    purple: 'bg-purple-600',
    orange: 'bg-orange-600',
  };
  
  return (
    <div>
      <div className="flex justify-between mb-1">
        <span className="text-sm text-gray-700 dark:text-gray-300">{label}</span>
        <span className="text-sm font-semibold text-gray-900 dark:text-white">{value} ({percentage}%)</span>
      </div>
      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
        <div 
          className={`${colorClasses[color as keyof typeof colorClasses]} h-2 rounded-full transition-all duration-500`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
