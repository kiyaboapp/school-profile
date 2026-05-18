import { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Breadcrumb } from '@/components/ui/Breadcrumb';
import { formatNumber, getGenderSplit } from '@/lib/utils';
import { getCombBySlug, getCombStatsNational, getAvailableYears } from '@/lib/api';
import type { CombStats } from '@/types';

interface PageProps {
  params: { slug: string };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const combCode = params.slug.toUpperCase();
  
  return {
    title: `Mchanganyiko ${combCode} — Shule, Takwimu, Njia | ShuleYetu`,
    description: `Mchanganyiko ${combCode} Tanzania: shule zinazotoa, wanafunzi waliochaguliwa, na njia za kazi.`,
  };
}

export default async function CombinationNationalPage({ params }: PageProps) {
  const slug = params.slug;
  const combCode = slug.toUpperCase();
  
  // Fetch data from FastAPI backend
  const [comb, stats, availableYears] = await Promise.all([
    getCombBySlug(slug),
    getCombStatsNational(combCode),
    getAvailableYears(),
  ]);

  if (!comb) {
    notFound();
  }

  const latestStats = stats[0];
  const outsideRegion = Math.max(0, latestStats.total_placed - 
    (latestStats.female_count + latestStats.male_count) / 2);

  const breadcrumbItems = [
    { label: 'Tanzania', href: '/' },
    { label: 'Mchanganyiko', href: '/comb' },
    { label: combCode, href: `/comb/${slug}` },
  ];

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <Breadcrumb items={breadcrumbItems} />
        
        <div className="mt-6">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white">{comb.code}</h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 mt-2">{comb.name}</p>
          
          {comb.specialization && (
            <span className="inline-block mt-3 px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-sm font-medium">
              {comb.specialization.name}
            </span>
          )}
        </div>

        {/* Subjects */}
        <section className="mt-8 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Masomo ndani ya Mchanganyiko huu</h2>
          <div className="flex flex-wrap gap-3">
            {comb.comb_subjects?.map((subject, idx) => (
              <Link
                key={idx}
                href={`/somo/${subject.subject_slug}`}
                className="px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg text-gray-700 dark:text-gray-200 transition-colors"
              >
                {subject.subject_name}
              </Link>
            ))}
          </div>
        </section>

        {/* National Stats */}
        <section className="mt-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Takwimu za Taifa</h2>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Jumla Waliochaguliwa</div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">{formatNumber(latestStats.total_placed)}</div>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Wasichana</div>
              <div className="text-2xl font-bold text-pink-600 dark:text-pink-400">{formatNumber(latestStats.female_count)}</div>
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {getGenderSplit(latestStats.female_count, latestStats.male_count)}
              </div>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Wavulana</div>
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{formatNumber(latestStats.male_count)}</div>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Shule Zinatoa</div>
              <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">{formatNumber(latestStats.schools_receiving)}</div>
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">Shule za A-Level</div>
            </div>
          </div>
        </section>

        {/* Regional Breakdown */}
        <section className="mt-8 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Usambazaji kwa Mikoa</h2>
          <div className="space-y-3">
            {/* This would be fetched from API in production */}
            <p className="text-sm text-gray-500 dark:text-gray-400 italic">Data ya mikoa inapatikuna kwenye viungo vifuatavyo...</p>
          </div>
        </section>

        {/* Career Pathways */}
        {comb.career_pathways && (
          <section className="mt-8 bg-green-50 dark:bg-green-900/30 rounded-lg border border-green-200 dark:border-green-800 p-6">
            <h2 className="text-lg font-semibold text-green-900 dark:text-green-200 mb-2">Njia za Kazi</h2>
            <p className="text-green-800 dark:text-green-300">{comb.career_pathways}</p>
          </section>
        )}

        {/* Info Box */}
        <section className="mt-8 p-6 bg-blue-50 dark:bg-blue-900/30 rounded-lg border border-blue-200 dark:border-blue-800">
          <h3 className="font-semibold text-blue-900 dark:text-blue-200 mb-2">Kuhusu Mchanganyiko huu</h3>
          <p className="text-sm text-blue-800 dark:text-blue-300">
            Mchanganyiko {comb.code} ni mojawapo ya mchanganyiko maarufu katika elimu ya A-Level Tanzania.
            Wanafunzi waliochaguliwa katika mchanganyiko huu huenda shule {latestStats.schools_receiving} 
            tofauti za A-Level nchini. Mwaka {latestStats.cycle_year}, wanafunzi {latestStats.total_placed} 
            walipata uchaguzi.
          </p>
        </section>
      </div>
    </main>
  );
}
