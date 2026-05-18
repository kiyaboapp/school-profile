import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { MapPin, Building2, Users, TrendingUp, School, ChevronRight } from 'lucide-react';

// Mock data fetcher - Replace with actual API call
async function getWardData(slug: string) {
  // TODO: Replace with fetch(`http://localhost:8000/api/wards/${slug}`)
  return {
    id: 'ward_001',
    name: 'Buguruni',
    slug: 'buguruni',
    code: '020101',
    council: { name: 'Ilala', slug: 'ilala' },
    region: { name: 'Dar es Salaam', slug: 'dar-es-salaam' },
    population: 89564,
    area_km2: 12.5,
    schools_count: 45,
    students_count: 18500,
    description: 'Buguruni is a ward in Ilala Municipal Council, Dar es Salaam. It is a densely populated residential area with a mix of primary and secondary schools.',
    coordinates: { lat: -6.8333, lng: 39.2500 },
    nearby_landmarks: ['Buguruni Market', 'Mchafukoge Primary School', 'Buguruni Police Station'],
    schools_by_level: {
      primary: 28,
      secondary: 12,
      vocational: 3,
      other: 2
    }
  };
}

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const ward = await getWardData(slug);
  
  if (!ward) {
    return { title: 'Ward Not Found' };
  }

  return {
    title: `${ward.name} Ward | ShuleYetu`,
    description: `Complete profile of ${ward.name} ward including schools and education statistics in ${ward.council.name}, ${ward.region.name}.`,
    openGraph: {
      title: `${ward.name} Ward - ShuleYetu`,
      description: `Explore education data for ${ward.name}. ${ward.schools_count} schools, ${ward.students_count.toLocaleString()} students.`,
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${ward.name} Ward`,
      description: `Education statistics and school data for ${ward.name}.`,
    },
  };
}

export default async function WardProfilePage({ params }: PageProps) {
  const { slug } = await params;
  const ward = await getWardData(slug);

  if (!ward) {
    notFound();
  }

  const breadcrumbs = [
    { label: 'Home', href: '/' },
    { label: 'Regions', href: '/shuleni/regions' },
    { label: ward.region.name, href: `/shuleni/region/${ward.region.slug}` },
    { label: ward.council.name, href: `/shuleni/council/${ward.council.slug}` },
    { label: ward.name, href: `/shuleni/ward/${ward.slug}` },
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
          <div className="relative h-48 bg-gradient-to-r from-purple-600 to-pink-700">
            <div className="absolute inset-0 bg-black/20"></div>
            <div className="absolute bottom-0 left-0 p-6">
              <div className="flex items-center space-x-2 text-purple-100 mb-2">
                <MapPin className="w-5 h-5" />
                <span className="text-sm font-medium">Ward Profile</span>
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-white">{ward.name}</h1>
              <p className="text-purple-100 mt-1">Code: {ward.code} • {ward.council.name} • {ward.region.name}</p>
            </div>
          </div>
          
          <div className="p-6">
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
              {ward.description}
            </p>
            
            <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
                <div className="flex items-center space-x-2 text-gray-500 dark:text-gray-400 mb-1">
                  <School className="w-4 h-4" />
                  <span className="text-xs font-medium">Total Schools</span>
                </div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{ward.schools_count}</p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
                <div className="flex items-center space-x-2 text-gray-500 dark:text-gray-400 mb-1">
                  <Users className="w-4 h-4" />
                  <span className="text-xs font-medium">Students</span>
                </div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{ward.students_count.toLocaleString()}</p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
                <div className="flex items-center space-x-2 text-gray-500 dark:text-gray-400 mb-1">
                  <TrendingUp className="w-4 h-4" />
                  <span className="text-xs font-medium">Area</span>
                </div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{ward.area_km2} km²</p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
                <div className="flex items-center space-x-2 text-gray-500 dark:text-gray-400 mb-1">
                  <Building2 className="w-4 h-4" />
                  <span className="text-xs font-medium">Population</span>
                </div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{ward.population.toLocaleString()}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Schools by Level */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center">
                <School className="w-5 h-5 mr-2 text-purple-600" />
                Schools by Level
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">{ward.schools_by_level.primary}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Primary</p>
                </div>
                <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <p className="text-3xl font-bold text-green-600 dark:text-green-400">{ward.schools_by_level.secondary}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Secondary</p>
                </div>
                <div className="text-center p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                  <p className="text-3xl font-bold text-orange-600 dark:text-orange-400">{ward.schools_by_level.vocational}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Vocational</p>
                </div>
                <div className="text-center p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <p className="text-3xl font-bold text-gray-600 dark:text-gray-400">{ward.schools_by_level.other}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Other</p>
                </div>
              </div>
            </div>

            {/* Nearby Landmarks */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Nearby Landmarks</h2>
              <ul className="space-y-2">
                {ward.nearby_landmarks.map((landmark, idx) => (
                  <li key={idx} className="flex items-center space-x-2 text-gray-700 dark:text-gray-300">
                    <MapPin className="w-4 h-4 text-purple-600" />
                    <span>{landmark}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Map Placeholder */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Location</h2>
              <div className="aspect-video bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                <div className="text-center text-gray-500 dark:text-gray-400">
                  <MapPin className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>Interactive map for {ward.name}</p>
                  <p className="text-sm">Coordinates: {ward.coordinates.lat}, {ward.coordinates.lng}</p>
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
                  href={`/shuleni/schools?ward=${ward.slug}`}
                  className="block w-full px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-center font-medium transition-colors"
                >
                  Browse All Schools
                </Link>
                <Link
                  href={`/shuleni/results?ward=${ward.slug}`}
                  className="block w-full px-4 py-2.5 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-lg text-center font-medium transition-colors"
                >
                  View Exam Results
                </Link>
              </div>
            </div>

            {/* Ward Details */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Details</h3>
              <dl className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <dt className="text-gray-500 dark:text-gray-400">Council</dt>
                  <dd className="font-medium text-gray-900 dark:text-white">
                    <Link href={`/shuleni/council/${ward.council.slug}`} className="hover:text-purple-600 dark:hover:text-purple-400">
                      {ward.council.name}
                    </Link>
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-500 dark:text-gray-400">Region</dt>
                  <dd className="font-medium text-gray-900 dark:text-white">
                    <Link href={`/shuleni/region/${ward.region.slug}`} className="hover:text-purple-600 dark:hover:text-purple-400">
                      {ward.region.name}
                    </Link>
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-500 dark:text-gray-400">Area</dt>
                  <dd className="font-medium text-gray-900 dark:text-white">{ward.area_km2} km²</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-500 dark:text-gray-400">Population</dt>
                  <dd className="font-medium text-gray-900 dark:text-white">{ward.population.toLocaleString()}</dd>
                </div>
              </dl>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
