import { Metadata } from 'next';
import Link from 'next/link';
import { Breadcrumb } from '@/components/ui/Breadcrumb';
import { YearSelector } from '@/components/ui/YearSelector';
import { formatNumber, getGenderSplit } from '@/lib/utils';
import { getAvailableYears } from '@/lib/api';

interface PageProps {
  params: { year: string };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const year = parseInt(params.year);
  
  return {
    title: `Uchaguzi wa Wanafunzi Tanzania ${year} | ShuleYetu`,
    description: `Takwimu za uchaguzi wa wanafunzi Tanzania mwaka ${year}. Mchanganyiko, vyuo, na shule walizoenda wanafunzi.`,
  };
}

export default async function NationalSelectionsPage({ params }: PageProps) {
  const year = parseInt(params.year);
  const availableYears = await getAvailableYears();

  // Mock national stats
  const mockStats = {
    totalSelected: 185000,
    alevel: 95000,
    college: 45000,
    boarding: 52000,
    day: 43000,
    topCombinations: [
      { code: 'PCM', count: 18500 },
      { code: 'HGE', count: 15200 },
      { code: 'CBG', count: 12800 },
      { code: 'PCB', count: 11500 },
      { code: 'ECA', count: 9800 },
    ],
    topSchoolsIncoming: [
      { name: 'Jangwani High School', slug: 'jangwani-high-school', count: 1250 },
      { name: 'Azania Secondary', slug: 'azania-secondary', count: 1180 },
      { name: 'Tambaza High School', slug: 'tambaza-high-school', count: 1050 },
      { name: 'Mkwawa High School', slug: 'mkwawa-high-school', count: 980 },
      { name: 'Kilakala Girls', slug: 'kilakala-girls', count: 920 },
    ],
    topSchoolsOutgoing: [
      { name: 'Msasani Secondary', slug: 'msasani-secondary', count: 850 },
      { name: 'Gerezani Secondary', slug: 'gerezani-secondary', count: 780 },
      { name: 'Upanga Secondary', slug: 'upanga-secondary', count: 720 },
      { name: 'Kariakoo Secondary', slug: 'kariakoo-secondary', count: 680 },
      { name: 'Ilala Secondary', slug: 'ilala-secondary', count: 650 },
    ],
  };

  const breadcrumbItems = [
    { label: 'Tanzania', href: '/' },
    { label: 'Uchaguzi', href: '/uchaguzi' },
    { label: year.toString(), href: `/uchaguzi/${year}` },
  ];

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <Breadcrumb items={breadcrumbItems} />
        
        <div className="mt-6 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-gray-900">
              Uchaguzi wa Wanafunzi Tanzania
            </h1>
            <p className="text-xl text-gray-600 mt-2">
              Mwaka {year}
            </p>
          </div>
          
          <YearSelector 
            currentYear={year}
            availableYears={availableYears}
            baseUrl="/uchaguzi"
          />
        </div>

        {/* National Summary */}
        <section className="mt-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Muhtasari wa Taifa</h2>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="text-sm text-gray-500 mb-1">Jumla Waliochaguliwa</div>
              <div className="text-3xl font-bold text-gray-900">{formatNumber(mockStats.totalSelected)}</div>
            </div>
            
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="text-sm text-gray-500 mb-1">A-Level</div>
              <div className="text-3xl font-bold text-blue-600">{formatNumber(mockStats.alevel)}</div>
            </div>
            
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="text-sm text-gray-500 mb-1">Vyuo</div>
              <div className="text-3xl font-bold text-green-600">{formatNumber(mockStats.college)}</div>
            </div>
            
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="text-sm text-gray-500 mb-1">Kiwango cha Bweni</div>
              <div className="text-3xl font-bold text-purple-600">
                {((mockStats.boarding / (mockStats.boarding + mockStats.day)) * 100).toFixed(0)}%
              </div>
              <div className="text-xs text-gray-500 mt-1">
                Bweni: {formatNumber(mockStats.boarding)} | Kutwa: {formatNumber(mockStats.day)}
              </div>
            </div>
          </div>
        </section>

        {/* Top Combinations */}
        <section className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Mchanganyiko Maarufu (Top 5)
            </h2>
            <div className="space-y-3">
              {mockStats.topCombinations.map((comb, idx) => (
                <Link
                  key={comb.code}
                  href={`/mchanganyiko/${comb.code.toLowerCase()}`}
                  className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 bg-blue-100 text-blue-800 rounded-full flex items-center justify-center text-sm font-bold">
                      {idx + 1}
                    </span>
                    <span className="font-semibold text-gray-900">{comb.code}</span>
                  </div>
                  <span className="text-gray-700">{formatNumber(comb.count)} wanafunzi</span>
                </Link>
              ))}
            </div>
          </div>

          {/* Top Incoming Schools */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Shule zinazopokea zaidi (A-Level)
            </h2>
            <div className="space-y-3">
              {mockStats.topSchoolsIncoming.map((school, idx) => (
                <Link
                  key={school.slug}
                  href={`/shule/${school.slug}`}
                  className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 bg-green-100 text-green-800 rounded-full flex items-center justify-center text-sm font-bold">
                      {idx + 1}
                    </span>
                    <span className="text-gray-700">{school.name}</span>
                  </div>
                  <span className="font-semibold text-gray-900">{formatNumber(school.count)}</span>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Top Outgoing Schools */}
        <section className="mt-8 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Shule zinazotuma zaidi (O-Level → A-Level)
          </h2>
          <div className="space-y-3">
            {mockStats.topSchoolsOutgoing.map((school, idx) => (
              <Link
                key={school.slug}
                href={`/shule/${school.slug}/uchaguzi/${year}`}
                className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 bg-purple-100 text-purple-800 rounded-full flex items-center justify-center text-sm font-bold">
                    {idx + 1}
                  </span>
                  <span className="text-gray-700">{school.name}</span>
                </div>
                <span className="font-semibold text-gray-900">{formatNumber(school.count)}</span>
              </Link>
            ))}
          </div>
        </section>

        {/* Info Box */}
        <section className="mt-8 p-6 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-900 mb-2">Kuhusu Takwimu hizi</h3>
          <p className="text-sm text-blue-800">
            Takwimu hizi ni muhtasari wa uchaguzi wote wa wanafunzi Tanzania kwa mwaka {year}.
            Zinajumuisha uchaguzi wa A-Level (shule za sekondari) na uchaguzi wa vyuo (diploma na stadi).
            Kila takwimu inatokana na data rasmi ya TAMISEMI.
          </p>
        </section>
      </div>
    </main>
  );
}
