import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Breadcrumb } from '@/components/ui/Breadcrumb';
import { YearSelector } from '@/components/ui/YearSelector';
import { GeographicScopeCard } from '@/components/selections/GeographicScopeCard';
import { CombinationBreakdown, FlowList } from '@/components/selections/CombinationBreakdown';
import { CollegeDestinations } from '@/components/selections/CollegeDestinations';
import { getSchoolBySlug, getSchoolSummaryStats, getSchoolCombStats, getSchoolCourseStats, getSchoolFlowStats, getAvailableYears } from '@/lib/api';
import type { SchoolSummaryStats, SchoolCombStats, SchoolCourseStats, SchoolFlowStats } from '@/types';

interface PageProps {
  params: { slug: string; year: string };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const year = parseInt(params.year);
  // In production, fetch school to get actual name
  const schoolName = 'Shule Yetu';
  
  return {
    title: `Uchaguzi ${year} — ${schoolName}: Mchanganyiko, Vyuo, Hatua | ShuleYetu`,
    description: `Wanafunzi waliochaguliwa kutoka ${schoolName} mwaka ${year}. Takwimu za mchanganyiko, vyuo, na shule walizoenda.`,
  };
}

export default async function SchoolSelectionsPage({ params }: PageProps) {
  const year = parseInt(params.year);
  const slug = params.slug;

  // Fetch data (in production, these would be real API calls)
  const [school, summaryStats, combStats, courseStats, outgoingFlows, availableYears] = await Promise.all([
    getSchoolBySlug(slug),
    getSchoolSummaryStats('centre_number_placeholder', year),
    getSchoolCombStats('centre_number_placeholder', year, 'origin'),
    getSchoolCourseStats('centre_number_placeholder', year),
    getSchoolFlowStats('centre_number_placeholder', year, 'origin'),
    getAvailableYears(),
  ]);

  if (!school) {
    notFound();
  }

  // Mock data for demonstration (remove in production when API is ready)
  const mockSummary: SchoolSummaryStats = {
    id: 1,
    centre_number: 'S0001',
    cycle_year: year,
    outgoing_total: 150,
    outgoing_female: 75,
    outgoing_male: 75,
    outgoing_alevel: 120,
    outgoing_college: 30,
    outgoing_day: 45,
    outgoing_boarding: 75,
    outgoing_ward_scope: 25,
    outgoing_council_scope: 35,
    outgoing_regional_scope: 40,
    outgoing_destinations: 45,
    incoming_total: 0,
    incoming_female: 0,
    incoming_male: 0,
    incoming_origins: 0,
  };

  const breadcrumbItems = [
    { label: 'Tanzania', href: '/' },
    { label: school.region?.region_name || 'Mkoa', href: `/mkoa/${school.region?.slug || 'mkoa-slug'}` },
    { label: school.council?.council_name || 'Halmashauri', href: `/halmashauri/${school.council?.slug || 'halmashauri-slug'}` },
    { label: school.ward?.ward_name || 'Kata', href: `/kata/${school.ward?.slug || 'kata-slug'}` },
    { label: school.school_name, href: `/shule/${slug}` },
    { label: 'Uchaguzi', href: `/shule/${slug}/uchaguzi` },
  ];

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Breadcrumb items={breadcrumbItems} />
          
          <div className="mt-4 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {school.school_name}
              </h1>
              <p className="text-gray-500 mt-1">
                Uchaguzi wa Wanafunzi — Mwaka {year}
              </p>
            </div>
            
            <YearSelector 
              currentYear={year}
              availableYears={availableYears}
              baseUrl={`/shule/${slug}/uchaguzi`}
            />
          </div>
        </div>

        {/* Summary Stats */}
        {mockSummary && (
          <section className="mb-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="text-sm text-gray-500 mb-1">Jumla Waliochaguliwa</div>
                <div className="text-2xl font-bold text-gray-900">{mockSummary.outgoing_total}</div>
                <div className="text-xs text-gray-500 mt-1">
                  Wasichana: {mockSummary.outgoing_female} | Wavulana: {mockSummary.outgoing_male}
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="text-sm text-gray-500 mb-1">A-Level</div>
                <div className="text-2xl font-bold text-blue-600">{mockSummary.outgoing_alevel}</div>
                <div className="text-xs text-gray-500 mt-1">
                  Bweni: {mockSummary.outgoing_boarding} | Kutwa: {mockSummary.outgoing_day}
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="text-sm text-gray-500 mb-1">Vyuo</div>
                <div className="text-2xl font-bold text-green-600">{mockSummary.outgoing_college}</div>
                <div className="text-xs text-gray-500 mt-1">
                  Kozi mbalimbali
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="text-sm text-gray-500 mb-1">Shule za Kusudi</div>
                <div className="text-2xl font-bold text-purple-600">{mockSummary.outgoing_destinations}</div>
                <div className="text-xs text-gray-500 mt-1">
                  Jumla ya shule
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Geographic Scope */}
          <GeographicScopeCard stats={mockSummary} />

          {/* Combinations */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Mchanganyiko waliochaguliwa
            </h3>
            <CombinationBreakdown combStats={[]} year={year} />
          </div>
        </div>

        {/* College Destinations */}
        <section className="mt-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Vyuo na Kozi walizochaguliwa
            </h3>
            <CollegeDestinations courseStats={[]} year={year} />
          </div>
        </section>

        {/* Destination Schools */}
        <section className="mt-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Shule walizoenda (Top 10)
            </h3>
            <FlowList flows={[]} direction="origin" limit={10} />
          </div>
        </section>

        {/* Info Box */}
        <section className="mt-8 p-6 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-900 mb-2">Kuhusu Takwimu hizi</h3>
          <p className="text-sm text-blue-800">
            Takwimu hizi zinatokana na data ya uchaguzi wa TAMISEMI. 
            &quot;KATA&quot; inamaanisha wanafunzi waliochaguliwa ndani ya kata yao ya asili.
            &quot;MKOA&quot; inamaanisha waliochaguliwa ndani ya mkoa wao.
            Wanafunzi waliochaguliwa nje ya mkoa huenda shule za kitaifa zenye ushindani mkubwa.
          </p>
        </section>
      </div>
    </main>
  );
}
