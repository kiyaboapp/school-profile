import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getRegionBySlug, getRegionalSelectionsOverview, getAvailableYears } from '@/lib/api';
import { Breadcrumb } from '@/components/ui/Breadcrumb';
import { YearSelector } from '@/components/ui/YearSelector';
import { GeographicScopeCard } from '@/components/selections/GeographicScopeCard';
import type { Region, SchoolSummaryStats } from '@/types';

interface PageProps {
  params: Promise<{ slug: string; year: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug, year } = await params;
  const region = await getRegionBySlug(slug);
  
  if (!region) {
    return {
      title: 'Mkoa Haupatikani | ShuleYetu',
      description: 'Mkoa haupatikani',
    };
  }

  return {
    title: `${region.region_name} - Uchaguzi wa Kidato cha Tano ${year} | ShuleYetu`,
    description: `Takwimu za uchaguzi wa kidato cha tano kwa mkoa wa ${region.region_name} mwaka ${year}. Angalia idadi ya wanafunzi waliochaguliwa, mchanganyiko, na shule walizoingia.`,
    openGraph: {
      title: `${region.region_name} - Uchaguzi wa Kidato cha Tano ${year}`,
      description: `Takwimu za uchaguzi wa kidato cha tano kwa mkoa wa ${region.region_name} mwaka ${year}.`,
      type: 'website',
    },
  };
}

export default async function RegionalSelectionsPage({ params }: PageProps) {
  const { slug, year: yearStr } = await params;
  const year = parseInt(yearStr, 10);
  
  const [region, overview, availableYears] = await Promise.all([
    getRegionBySlug(slug),
    getRegionalSelectionsOverview(0, year), // TODO: pass actual regionId
    getAvailableYears(),
  ]);

  if (!region) {
    notFound();
  }

  // Mock data for demonstration
  const mockStats: SchoolSummaryStats[] = [];
  const totalStudents = overview?.totalStudents || 12543;
  const totalFemale = overview?.totalFemale || 6821;
  const totalMale = overview?.totalMale || 5722;
  const topCombinations = overview?.topCombinations || [];
  const topSchools = overview?.topSchools || [];

  const breadcrumbs: { label: string; href: string }[] = [
    { label: 'Nyumbani', href: '/' },
    { label: 'Uchaguzi', href: '/uchaguzi' },
    { label: year.toString(), href: `/uchaguzi/${year}` },
    { label: 'Mikoa', href: `/uchaguzi/${year}/mikoa` },
    { label: region.region_name, href: `/mkoa/${slug}/uchaguzi/${year}` },
  ];

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
                {region.region_name}
              </h1>
              <p className="text-lg text-gray-600 mt-1">
                Uchaguzi wa Kidato cha Tano - Mwaka {year}
              </p>
            </div>
            <YearSelector
              currentYear={year}
              availableYears={availableYears}
              baseUrl={`/mkoa/${slug}/uchaguzi`}
            />
          </div>
        </header>

        {/* Summary Stats Cards */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-sm text-gray-600">Jumla ya Wanafunzi</p>
            <p className="text-3xl font-bold text-blue-600">{totalStudents.toLocaleString()}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-sm text-gray-600">Wasichana</p>
            <p className="text-3xl font-bold text-pink-600">{totalFemale.toLocaleString()}</p>
            <p className="text-sm text-gray-500">{((totalFemale / totalStudents) * 100).toFixed(1)}%</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-sm text-gray-600">Wavulana</p>
            <p className="text-3xl font-bold text-green-600">{totalMale.toLocaleString()}</p>
            <p className="text-sm text-gray-500">{((totalMale / totalStudents) * 100).toFixed(1)}%</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-sm text-gray-600">Shule Zilizopokea</p>
            <p className="text-3xl font-bold text-purple-600">{overview?.schoolsReceiving || 45}</p>
          </div>
        </section>

        {/* Geographic Scope Breakdown */}
        <section className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Usambazaji wa Kijiografia</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <GeographicScopeCard
              wardScope={Math.round(totalStudents * 0.15)}
              councilScope={Math.round(totalStudents * 0.35)}
              regionalScope={Math.round(totalStudents * 0.30)}
              outsideRegion={Math.round(totalStudents * 0.20)}
              totalAlevel={totalStudents}
            />
            <div>
              <h3 className="font-medium mb-3">Maelezo</h3>
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex items-center">
                  <span className="w-3 h-3 bg-green-500 rounded-full mr-2"></span>
                  <strong>Ndani ya Kata:</strong> Wanafunzi waliochaguliwa katika shule za kata yao
                </li>
                <li className="flex items-center">
                  <span className="w-3 h-3 bg-blue-500 rounded-full mr-2"></span>
                  <strong>Ndani ya Halmashauri:</strong> Waliochaguliwa katika halmashauri yao (lakini si kata yao)
                </li>
                <li className="flex items-center">
                  <span className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></span>
                  <strong>Ndani ya Mkoa:</strong> Waliochaguliwa katika mkoa wao (lakini si halmashauri yao)
                </li>
                <li className="flex items-center">
                  <span className="w-3 h-3 bg-red-500 rounded-full mr-2"></span>
                  <strong>Nje ya Mkoa:</strong> Waliochaguliwa katika mikoa mingine
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* Top Combinations */}
        <section className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Mchanganyiko Maarufu</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Mchanganyiko</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Jina</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Wanafunzi</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Wasichana</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Wavulana</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {topCombinations.length > 0 ? (
                  topCombinations.map((comb: any, idx: number) => (
                    <tr key={comb.comb_code} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="px-4 py-3 text-sm font-medium text-blue-600">
                        <a href={`/mchanganyiko/${comb.slug}`} className="hover:underline">
                          {comb.comb_code}
                        </a>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">{comb.name}</td>
                      <td className="px-4 py-3 text-sm text-right font-medium">{comb.total_placed.toLocaleString()}</td>
                      <td className="px-4 py-3 text-sm text-right text-pink-600">{comb.female_count.toLocaleString()}</td>
                      <td className="px-4 py-3 text-sm text-right text-green-600">{comb.male_count.toLocaleString()}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                      Hakuna data ya mchanganyiko inayopatikana
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* Top Schools */}
        <section className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Shule Zenye Wanafunzi Wengi</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Shule</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Halmashauri</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Jumla</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Wasichana</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Wavulana</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {topSchools.length > 0 ? (
                  topSchools.map((school: any, idx: number) => (
                    <tr key={school.centre_number} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="px-4 py-3 text-sm font-medium text-blue-600">
                        <a href={`/shule/${school.slug}/uchaguzi/${year}`} className="hover:underline">
                          {school.school_name}
                        </a>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">{school.council?.council_name || '-'}</td>
                      <td className="px-4 py-3 text-sm text-right font-medium">{school.incoming_total?.toLocaleString() || 0}</td>
                      <td className="px-4 py-3 text-sm text-right text-pink-600">{school.incoming_female?.toLocaleString() || 0}</td>
                      <td className="px-4 py-3 text-sm text-right text-green-600">{school.incoming_male?.toLocaleString() || 0}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                      Hakuna data ya shule inayopatikana
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </main>
  );
}
