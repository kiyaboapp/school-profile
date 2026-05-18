import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getCombBySlug, getCombStatsByCouncil, getCouncilBySlug } from '@/lib/api';
import { Breadcrumb } from '@/components/ui/Breadcrumb';
import type { NectaComb, CombStats, Council } from '@/types';

interface PageProps {
  params: Promise<{ slug: string; council_slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug, council_slug } = await params;
  const [comb, council] = await Promise.all([
    getCombBySlug(slug),
    getCouncilBySlug(council_slug),
  ]);
  
  if (!comb || !council) {
    return {
      title: 'Haupatikani | ShuleYetu',
      description: 'Mchanganyiko au halmashauri haupatikani',
    };
  }

  return {
    title: `${comb.code} (${council.council_name}) - Takwimu za Halmashauri | ShuleYetu`,
    description: `Takwimu za mchanganyiko wa ${comb.code} - ${comb.name} katika halmashauri ya ${council.council_name}. Angalia shule zinazofundisha na idadi ya wanafunzi.`,
    openGraph: {
      title: `${comb.code} (${council.council_name}) - Takwimu za Halmashauri`,
      description: `Takwimu za mchanganyiko wa ${comb.code} - ${comb.name} katika halmashauri ya ${council.council_name}.`,
      type: 'website',
    },
  };
}

export default async function CombinationCouncilPage({ params }: PageProps) {
  const { slug, council_slug } = await params;
  
  const [comb, council, combStats] = await Promise.all([
    getCombBySlug(slug),
    getCouncilBySlug(council_slug),
    getCombStatsByCouncil(0, 0), // TODO: pass actual combCode and councilId
  ]);

  if (!comb || !council) {
    notFound();
  }

  // Mock data for demonstration
  const stats: CombStats[] = combStats.length > 0 ? combStats : [];
  const totalPlaced = stats.reduce((sum, s) => sum + s.total_placed, 0) || 1245;
  const totalFemale = stats.reduce((sum, s) => sum + s.female_count, 0) || 678;
  const totalMale = stats.reduce((sum, s) => sum + s.male_count, 0) || 567;
  const schoolsReceiving = stats.reduce((sum, s) => sum + s.schools_receiving, 0) || 18;

  const breadcrumbs: { label: string; href: string }[] = [
    { label: 'Nyumbani', href: '/' },
    { label: 'Mchanganyiko', href: '/mchanganyiko' },
    { label: comb.code, href: `/mchanganyiko/${slug}` },
    { label: 'Mikoa', href: `/mchanganyiko/${slug}/mikoa` },
    { label: council.region?.region_name || 'Mkoa', href: `/mchanganyiko/${slug}/mkoa/${council.region?.slug || 'dar-es-salaam'}` },
    { label: council.council_name, href: `/mchanganyiko/${slug}/halmashauri/${council_slug}` },
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
                Halmashauri ya {council.council_name}
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

        {/* All Schools in Council */}
        <section className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Shule Zote zinazofundisha {comb.code}</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Shule</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Kata</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Wanafunzi</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Wasichana</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Wavulana</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {/* Mock data - in production this would come from API */}
                <tr>
                  <td className="px-4 py-3 text-sm font-medium text-blue-600">
                    <a href={`/shule/kinondoni-secondary/uchaguzi/2024`} className="hover:underline">
                      Kinondoni Secondary School
                    </a>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900">Kinondoni</td>
                  <td className="px-4 py-3 text-sm text-right font-medium">156</td>
                  <td className="px-4 py-3 text-sm text-right text-pink-600">84</td>
                  <td className="px-4 py-3 text-sm text-right text-green-600">72</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 text-sm font-medium text-blue-600">
                    <a href={`/shule/mwananyamala-secondary/uchaguzi/2024`} className="hover:underline">
                      Mwananyamala Secondary School
                    </a>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900">Mwananyamala</td>
                  <td className="px-4 py-3 text-sm text-right font-medium">132</td>
                  <td className="px-4 py-3 text-sm text-right text-pink-600">71</td>
                  <td className="px-4 py-3 text-sm text-right text-green-600">61</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 text-sm font-medium text-blue-600">
                    <a href={`/shule/kawe-secondary/uchaguzi/2024`} className="hover:underline">
                      Kawe Secondary School
                    </a>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900">Kawe</td>
                  <td className="px-4 py-3 text-sm text-right font-medium">98</td>
                  <td className="px-4 py-3 text-sm text-right text-pink-600">52</td>
                  <td className="px-4 py-3 text-sm text-right text-green-600">46</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </main>
  );
}
