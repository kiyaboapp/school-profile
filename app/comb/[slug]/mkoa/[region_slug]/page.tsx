import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getCombBySlug, getCombStatsByRegion, getAvailableYears, getRegionBySlug } from '@/lib/api';
import { Breadcrumb } from '@/components/ui/Breadcrumb';
import type { NectaComb, CombStats, Region } from '@/types';

interface PageProps {
  params: Promise<{ slug: string; region_slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug, region_slug } = await params;
  const [comb, region] = await Promise.all([
    getCombBySlug(slug),
    getRegionBySlug(region_slug),
  ]);
  
  if (!comb || !region) {
    return {
      title: 'Haupatikani | ShuleYetu',
      description: 'Mchanganyiko au mkoa haupatikani',
    };
  }

  return {
    title: `${comb.code} (${region.region_name}) - Takwimu za Taifa | ShuleYetu`,
    description: `Takwimu za mchanganyiko wa ${comb.code} - ${comb.name} katika mkoa wa ${region.region_name}. Angalia shule zinazofundisha, idadi ya wanafunzi, na njia za kazi.`,
    openGraph: {
      title: `${comb.code} (${region.region_name}) - Takwimu za Taifa`,
      description: `Takwimu za mchanganyiko wa ${comb.code} - ${comb.name} katika mkoa wa ${region.region_name}.`,
      type: 'website',
    },
  };
}

export default async function CombinationRegionalPage({ params }: PageProps) {
  const { slug, region_slug } = await params;
  
  const [comb, region, combStats, availableYears] = await Promise.all([
    getCombBySlug(slug),
    getRegionBySlug(region_slug),
    getCombStatsByRegion(0, 0), // TODO: pass actual combCode and regionId
    getAvailableYears(),
  ]);

  if (!comb || !region) {
    notFound();
  }

  // Mock data for demonstration
  const stats: CombStats[] = combStats.length > 0 ? combStats : [];
  const totalPlaced = stats.reduce((sum, s) => sum + s.total_placed, 0) || 8542;
  const totalFemale = stats.reduce((sum, s) => sum + s.female_count, 0) || 4621;
  const totalMale = stats.reduce((sum, s) => sum + s.male_count, 0) || 3921;
  const schoolsReceiving = stats.reduce((sum, s) => sum + s.schools_receiving, 0) || 125;

  const breadcrumbs: { label: string; href: string }[] = [
    { label: 'Nyumbani', href: '/' },
    { label: 'Mchanganyiko', href: '/mchanganyiko' },
    { label: comb.code, href: `/mchanganyiko/${slug}` },
    { label: 'Mikoa', href: `/mchanganyiko/${slug}/mikoa` },
    { label: region.region_name, href: `/mchanganyiko/${slug}/mkoa/${region_slug}` },
  ];

  // Get subjects from combination
  const subjects = comb.comb_subjects || [];

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <Breadcrumb items={breadcrumbs} />

        {/* Header */}
        <header className="mt-6 mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {comb.code} - {comb.name}
              </h1>
              <p className="text-lg text-gray-600 mt-1">
                Mkoa wa {region.region_name}
              </p>
              {subjects.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {subjects.map((subj) => (
                    <span
                      key={subj.subject_code}
                      className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800"
                    >
                      {subj.subject_code}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Summary Stats Cards */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-sm text-gray-600">Jumla ya Wanafunzi</p>
            <p className="text-3xl font-bold text-blue-600">{totalPlaced.toLocaleString()}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-sm text-gray-600">Wasichana</p>
            <p className="text-3xl font-bold text-pink-600">{totalFemale.toLocaleString()}</p>
            <p className="text-sm text-gray-500">{((totalFemale / totalPlaced) * 100).toFixed(1)}%</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-sm text-gray-600">Wavulana</p>
            <p className="text-3xl font-bold text-green-600">{totalMale.toLocaleString()}</p>
            <p className="text-sm text-gray-500">{((totalMale / totalPlaced) * 100).toFixed(1)}%</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-sm text-gray-600">Shule Zinazofundisha</p>
            <p className="text-3xl font-bold text-purple-600">{schoolsReceiving}</p>
          </div>
        </section>

        {/* Career Pathways */}
        {comb.career_pathways && (
          <section className="bg-white rounded-lg shadow p-6 mb-8">
            <h2 className="text-xl font-semibold mb-4">Njia za Kazi</h2>
            <div className="prose max-w-none">
              <p className="text-gray-700 whitespace-pre-line">{comb.career_pathways}</p>
            </div>
          </section>
        )}

        {/* Councils Breakdown */}
        <section className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Halmashauri za {region.region_name}</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Halmashauri</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Wanafunzi</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Wasichana</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Wavulana</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Shule</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {stats.length > 0 ? (
                  stats.map((stat: CombStats, idx: number) => (
                    <tr key={stat.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="px-4 py-3 text-sm font-medium text-blue-600">
                        {stat.council ? (
                          <a
                            href={`/mchanganyiko/${slug}/halmashauri/${stat.council.slug}`}
                            className="hover:underline"
                          >
                            {stat.council.council_name}
                          </a>
                        ) : (
                          <span className="text-gray-500">Jumla ya Mkoa</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm text-right font-medium">
                        {stat.total_placed.toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-sm text-right text-pink-600">
                        {stat.female_count.toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-sm text-right text-green-600">
                        {stat.male_count.toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-sm text-right text-gray-600">
                        {stat.schools_receiving.toLocaleString()}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                      Hakuna data ya halmashauri inayopatikana
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* Top Schools Receiving */}
        <section className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Shule Bora zinazofundisha {comb.code}</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Shule</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Halmashauri</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Wanafunzi</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Wasichana</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Wavulana</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {/* Mock data - in production this would come from API */}
                <tr>
                  <td className="px-4 py-3 text-sm font-medium text-blue-600">
                    <a href={`/shule/example-secondary/uchaguzi/2024`} className="hover:underline">
                      Example Secondary School
                    </a>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900">Kinondoni</td>
                  <td className="px-4 py-3 text-sm text-right font-medium">245</td>
                  <td className="px-4 py-3 text-sm text-right text-pink-600">132</td>
                  <td className="px-4 py-3 text-sm text-right text-green-600">113</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 text-sm font-medium text-blue-600">
                    <a href={`/shule/model-secondary/uchaguzi/2024`} className="hover:underline">
                      Model Secondary School
                    </a>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900">Ilala</td>
                  <td className="px-4 py-3 text-sm text-right font-medium">198</td>
                  <td className="px-4 py-3 text-sm text-right text-pink-600">105</td>
                  <td className="px-4 py-3 text-sm text-right text-green-600">93</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </main>
  );
}
