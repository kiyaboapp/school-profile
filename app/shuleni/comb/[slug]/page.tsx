/**
 * Combination Detail Page - /shuleni/comb/[slug]
 */

import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getCombinationDetail, getCombinationNationalStats, getSchoolsOfferingComb, getFeederSchoolsForComb } from '@/lib/api';
import { formatNumber } from '@/lib/utils';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const data = await getCombinationDetail(slug);
  
  const combName = data?.name || slug.replace(/-/g, ' ').toUpperCase();
  
  return {
    title: `${combName} | Shuleni - Complete Combination Data`,
    description: `Comprehensive data for ${combName} (${data?.code}). View subject requirements, career pathways, schools offering this combination, and nationwide statistics.`,
    keywords: [`${combName}`, `${data?.code}`, 'A-Level combinations', 'Tanzania education', 'NECTA', 'career pathways'],
  };
}

export default async function CombinationPage({ params }: PageProps) {
  const { slug } = await params;
  
  const [detail, stats, schoolsOffering, feederSchools] = await Promise.all([
    getCombinationDetail(slug),
    getCombinationNationalStats(slug),
    getSchoolsOfferingComb(slug, undefined, 20),
    getFeederSchoolsForComb(slug, undefined, 20),
  ]);

  if (!detail) {
    notFound();
  }

  const totalStudents = stats.reduce((sum, s) => sum + s.total_students, 0);
  const totalSchools = stats.reduce((sum, s) => sum + s.schools_count, 0);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Hero */}
      <header className="bg-gradient-to-r from-purple-600 to-indigo-700 dark:from-purple-800 dark:to-indigo-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="text-sm mb-4 opacity-80">
            <a href="/shuleni" className="hover:underline">Home</a> / <span className="font-semibold">Combinations</span>
          </nav>
          <h1 className="text-5xl font-bold mb-2">{detail.name}</h1>
          <p className="text-2xl opacity-90 mb-4">{detail.code}</p>
          {detail.description && (
            <p className="text-lg opacity-90 max-w-3xl">{detail.description}</p>
          )}
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Subjects */}
            {detail.subjects && detail.subjects.length > 0 && (
              <section className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">📚 Required Subjects</h2>
                <div className="flex flex-wrap gap-2">
                  {detail.subjects.map((subject, i) => (
                    <span key={i} className="px-4 py-2 bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-400 rounded-full font-medium">
                      {subject}
                    </span>
                  ))}
                </div>
              </section>
            )}

            {/* Career Pathways */}
            {detail.career_pathways && detail.career_pathways.length > 0 && (
              <section className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">💼 Career Pathways</h2>
                <ul className="space-y-2">
                  {detail.career_pathways.map((pathway, i) => (
                    <li key={i} className="flex items-start">
                      <span className="text-purple-600 mr-2">→</span>
                      <span className="text-gray-700 dark:text-gray-300">{pathway}</span>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {/* Schools Offering */}
            <section className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">🏫 Top Schools Offering This Combination</h2>
              <div className="space-y-3">
                {schoolsOffering.slice(0, 10).map((school, i) => (
                  <div key={school.id || i} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <a href={`/shuleni/school/${school.combination?.slug}/selections/2024`} className="font-medium text-blue-600 hover:underline block truncate">
                      {school.combination?.name || 'School'}
                    </a>
                    <span className="font-bold">{formatNumber(school.students_count)}</span>
                  </div>
                ))}
              </div>
              <a href={`/shuleni/comb/${slug}/schools-offering`} className="mt-4 block text-center text-blue-600 hover:underline">
                View all schools →
              </a>
            </section>
          </div>

          {/* Sidebar */}
          <aside className="space-y-6">
            <section className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">📊 National Statistics</h3>
              <div className="space-y-4">
                <div>
                  <div className="text-3xl font-bold text-gray-900 dark:text-white">{formatNumber(totalStudents)}</div>
                  <div className="text-gray-600 dark:text-gray-400">Total Students</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-gray-900 dark:text-white">{formatNumber(totalSchools)}</div>
                  <div className="text-gray-600 dark:text-gray-400">Schools Offering</div>
                </div>
              </div>
            </section>
          </aside>
        </div>
      </main>
    </div>
  );
}
