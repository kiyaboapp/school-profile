import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { MapPin, Building2, Users, TrendingUp, School, ChevronRight, Globe } from 'lucide-react';

// Mock data fetcher - Replace with actual API call
async function getRegionData(slug: string) {
  // TODO: Replace with fetch(`http://localhost:8000/api/regions/${slug}`)
  return {
    id: 'reg_001',
    name: 'Dar es Salaam',
    slug: 'dar-es-salaam',
    code: '02',
    zone: 'Eastern',
    capital: 'Dar es Salaam',
    population: 5383728,
    area_km2: 1393,
    councils_count: 5,
    wards_count: 75,
    schools_count: 1250,
    students_count: 450000,
    description: 'Dar es Salaam is the largest city and former capital of Tanzania. It is the regional capital of the Dar es Salaam Region and is a major economic hub.',
    image_url: '/images/regions/dar-es-salaam.jpg',
    coordinates: { lat: -6.7924, lng: 39.2083 },
    top_councils: [
      { name: 'Ilala', slug: 'ilala', schools: 320 },
      { name: 'Kinondoni', slug: 'kinondoni', schools: 410 },
      { name: 'Temeke', slug: 'temeke', schools: 290 },
    ]
  };
}

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const region = await getRegionData(slug);
  
  if (!region) {
    return { title: 'Region Not Found' };
  }

  return {
    title: `${region.name} Region | ShuleYetu`,
    description: `Complete profile of ${region.name} region including schools, councils, wards, and education statistics.`,
    openGraph: {
      title: `${region.name} Region - ShuleYetu`,
      description: `Explore education data for ${region.name}. ${region.schools_count} schools, ${region.students_count.toLocaleString()} students.`,
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${region.name} Region`,
      description: `Education statistics and school data for ${region.name}.`,
    },
  };
}

export default async function RegionProfilePage({ params }: PageProps) {
  const { slug } = await params;
  const region = await getRegionData(slug);

  if (!region) {
    notFound();
  }

  const breadcrumbs = [
    { label: 'Home', href: '/' },
    { label: 'Regions', href: '/shuleni/regions' },
    { label: region.name, href: `/shuleni/region/${region.slug}` },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Breadcrumbs */}
      <nav className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center space-x-2 py-3 text-sm text-gray-500 dark:text-gray-400">
            {breadcrumbs.map((crumb, index) => (
              <div key={index} className="flex items-center">
                {index > 0 && <ChevronRight className="w-4 h-4 mx-1" />}
                {index === breadcrumbs.length - 1 ? (
                  <span className="font-medium text-gray-900 dark:text-white">{crumb.label}</span>
                ) : (
                  <Link href={crumb.href} className="hover:text-blue-600 dark:hover:text-blue-400">
                    {crumb.label}
                  </Link>
                )}
              </div>
            ))}
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden mb-8">
          <div className="relative h-48 bg-gradient-to-r from-blue-600 to-indigo-700">
            <div className="absolute inset-0 bg-black/20"></div>
            <div className="absolute bottom-0 left-0 p-6">
              <div className="flex items-center space-x-2 text-blue-100 mb-2">
                <MapPin className="w-5 h-5" />
                <span className="text-sm font-medium">Region Profile</span>
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-white">{region.name}</h1>
              <p className="text-blue-100 mt-1">Code: {region.code} • Zone: {region.zone}</p>
            </div>
          </div>
          
          <div className="p-6">
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
              {region.description}
            </p>
            
            <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
                <div className="flex items-center space-x-2 text-gray-500 dark:text-gray-400 mb-1">
                  <Building2 className="w-4 h-4" />
                  <span className="text-xs font-medium">Councils</span>
                </div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{region.councils_count}</p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
                <div className="flex items-center space-x-2 text-gray-500 dark:text-gray-400 mb-1">
                  <MapPin className="w-4 h-4" />
                  <span className="text-xs font-medium">Wards</span>
                </div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{region.wards_count}</p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
                <div className="flex items-center space-x-2 text-gray-500 dark:text-gray-400 mb-1">
                  <School className="w-4 h-4" />
                  <span className="text-xs font-medium">Schools</span>
                </div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{region.schools_count.toLocaleString()}</p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
                <div className="flex items-center space-x-2 text-gray-500 dark:text-gray-400 mb-1">
                  <Users className="w-4 h-4" />
                  <span className="text-xs font-medium">Students</span>
                </div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{region.students_count.toLocaleString()}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Top Councils */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center">
                <TrendingUp className="w-5 h-5 mr-2 text-blue-600" />
                Top Councils by School Count
              </h2>
              <div className="space-y-3">
                {region.top_councils.map((council, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <span className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 text-xs font-bold">
                        {idx + 1}
                      </span>
                      <Link 
                        href={`/shuleni/council/${council.slug}`}
                        className="font-medium text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400"
                      >
                        {council.name}
                      </Link>
                    </div>
                    <span className="text-sm text-gray-500 dark:text-gray-400">{council.schools} schools</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Map Placeholder */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Location</h2>
              <div className="aspect-video bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                <div className="text-center text-gray-500 dark:text-gray-400">
                  <MapPin className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>Interactive map for {region.name}</p>
                  <p className="text-sm">Coordinates: {region.coordinates.lat}, {region.coordinates.lng}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <Link
                  href={`/shuleni/schools?region=${region.slug}`}
                  className="block w-full px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-center font-medium transition-colors"
                >
                  Browse All Schools
                </Link>
                <Link
                  href={`/shuleni/results?region=${region.slug}`}
                  className="block w-full px-4 py-2.5 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-lg text-center font-medium transition-colors"
                >
                  View Exam Results
                </Link>
              </div>
            </div>

            {/* Region Info */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Details</h3>
              <dl className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <dt className="text-gray-500 dark:text-gray-400">Capital</dt>
                  <dd className="font-medium text-gray-900 dark:text-white">{region.capital}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-500 dark:text-gray-400">Area</dt>
                  <dd className="font-medium text-gray-900 dark:text-white">{region.area_km2.toLocaleString()} km²</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-500 dark:text-gray-400">Population</dt>
                  <dd className="font-medium text-gray-900 dark:text-white">{region.population.toLocaleString()}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-500 dark:text-gray-400">Zone</dt>
                  <dd className="font-medium text-gray-900 dark:text-white">{region.zone}</dd>
                </div>
              </dl>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
