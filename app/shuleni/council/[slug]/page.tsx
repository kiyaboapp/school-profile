import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { MapPin, Building2, Users, TrendingUp, School, ChevronRight, Phone, Mail } from 'lucide-react';

// Mock data fetcher - Replace with actual API call
async function getCouncilData(slug: string) {
  // TODO: Replace with fetch(`http://localhost:8000/api/councils/${slug}`)
  return {
    id: 'coun_001',
    name: 'Ilala',
    slug: 'ilala',
    code: '0201',
    region: { name: 'Dar es Salaam', slug: 'dar-es-salaam' },
    type: 'Urban',
    population: 1601897,
    area_km2: 283,
    wards_count: 22,
    schools_count: 320,
    students_count: 125000,
    description: 'Ilala Municipal Council is one of the five districts of Dar es Salaam Region. It serves as the commercial and administrative heart of the city.',
    headquarters: 'Ilala',
    coordinates: { lat: -6.8167, lng: 39.2833 },
    top_wards: [
      { name: 'Buguruni', slug: 'buguruni', schools: 45 },
      { name: 'Kariakoo', slug: 'kariakoo', schools: 38 },
      { name: 'Upanga', slug: 'upanga', schools: 32 },
    ],
    contact: {
      phone: '+255 22 286 5000',
      email: 'info@ilala.go.tz',
      website: 'https://www.ilala.go.tz'
    }
  };
}

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const council = await getCouncilData(slug);
  
  if (!council) {
    return { title: 'Council Not Found' };
  }

  return {
    title: `${council.name} Council | ShuleYetu`,
    description: `Complete profile of ${council.name} council including schools, wards, and education statistics in ${council.region.name}.`,
    openGraph: {
      title: `${council.name} Council - ShuleYetu`,
      description: `Explore education data for ${council.name}. ${council.schools_count} schools, ${council.students_count.toLocaleString()} students.`,
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${council.name} Council`,
      description: `Education statistics and school data for ${council.name}.`,
    },
  };
}

export default async function CouncilProfilePage({ params }: PageProps) {
  const { slug } = await params;
  const council = await getCouncilData(slug);

  if (!council) {
    notFound();
  }

  const breadcrumbs = [
    { label: 'Home', href: '/' },
    { label: 'Regions', href: '/shuleni/regions' },
    { label: council.region.name, href: `/shuleni/region/${council.region.slug}` },
    { label: council.name, href: `/shuleni/council/${council.slug}` },
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
          <div className="relative h-48 bg-gradient-to-r from-green-600 to-teal-700">
            <div className="absolute inset-0 bg-black/20"></div>
            <div className="absolute bottom-0 left-0 p-6">
              <div className="flex items-center space-x-2 text-green-100 mb-2">
                <Building2 className="w-5 h-5" />
                <span className="text-sm font-medium">Council Profile</span>
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-white">{council.name}</h1>
              <p className="text-green-100 mt-1">Code: {council.code} • {council.type} • {council.region.name}</p>
            </div>
          </div>
          
          <div className="p-6">
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
              {council.description}
            </p>
            
            <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
                <div className="flex items-center space-x-2 text-gray-500 dark:text-gray-400 mb-1">
                  <MapPin className="w-4 h-4" />
                  <span className="text-xs font-medium">Wards</span>
                </div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{council.wards_count}</p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
                <div className="flex items-center space-x-2 text-gray-500 dark:text-gray-400 mb-1">
                  <School className="w-4 h-4" />
                  <span className="text-xs font-medium">Schools</span>
                </div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{council.schools_count.toLocaleString()}</p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
                <div className="flex items-center space-x-2 text-gray-500 dark:text-gray-400 mb-1">
                  <Users className="w-4 h-4" />
                  <span className="text-xs font-medium">Students</span>
                </div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{council.students_count.toLocaleString()}</p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
                <div className="flex items-center space-x-2 text-gray-500 dark:text-gray-400 mb-1">
                  <TrendingUp className="w-4 h-4" />
                  <span className="text-xs font-medium">Type</span>
                </div>
                <p className="text-lg font-bold text-gray-900 dark:text-white">{council.type}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Top Wards */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center">
                <TrendingUp className="w-5 h-5 mr-2 text-green-600" />
                Top Wards by School Count
              </h2>
              <div className="space-y-3">
                {council.top_wards.map((ward, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <span className="flex items-center justify-center w-6 h-6 rounded-full bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-300 text-xs font-bold">
                        {idx + 1}
                      </span>
                      <Link 
                        href={`/shuleni/ward/${ward.slug}`}
                        className="font-medium text-gray-900 dark:text-white hover:text-green-600 dark:hover:text-green-400"
                      >
                        {ward.name}
                      </Link>
                    </div>
                    <span className="text-sm text-gray-500 dark:text-gray-400">{ward.schools} schools</span>
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
                  <p>Interactive map for {council.name}</p>
                  <p className="text-sm">Coordinates: {council.coordinates.lat}, {council.coordinates.lng}</p>
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
                  href={`/shuleni/schools?council=${council.slug}`}
                  className="block w-full px-4 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-lg text-center font-medium transition-colors"
                >
                  Browse All Schools
                </Link>
                <Link
                  href={`/shuleni/results?council=${council.slug}`}
                  className="block w-full px-4 py-2.5 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-lg text-center font-medium transition-colors"
                >
                  View Exam Results
                </Link>
              </div>
            </div>

            {/* Contact Info */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Contact Information</h3>
              <dl className="space-y-3 text-sm">
                {council.contact.phone && (
                  <div className="flex items-start space-x-3">
                    <Phone className="w-4 h-4 text-gray-500 dark:text-gray-400 mt-0.5" />
                    <div>
                      <dt className="text-gray-500 dark:text-gray-400">Phone</dt>
                      <dd className="font-medium text-gray-900 dark:text-white">{council.contact.phone}</dd>
                    </div>
                  </div>
                )}
                {council.contact.email && (
                  <div className="flex items-start space-x-3">
                    <Mail className="w-4 h-4 text-gray-500 dark:text-gray-400 mt-0.5" />
                    <div>
                      <dt className="text-gray-500 dark:text-gray-400">Email</dt>
                      <dd className="font-medium text-gray-900 dark:text-white break-all">{council.contact.email}</dd>
                    </div>
                  </div>
                )}
                {council.contact.website && (
                  <div className="flex items-start space-x-3">
                    <Building2 className="w-4 h-4 text-gray-500 dark:text-gray-400 mt-0.5" />
                    <div>
                      <dt className="text-gray-500 dark:text-gray-400">Website</dt>
                      <dd>
                        <a 
                          href={council.contact.website} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="font-medium text-green-600 dark:text-green-400 hover:underline break-all"
                        >
                          {council.contact.website.replace(/^https?:\/\//, '')}
                        </a>
                      </dd>
                    </div>
                  </div>
                )}
              </dl>
            </div>

            {/* Council Details */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Details</h3>
              <dl className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <dt className="text-gray-500 dark:text-gray-400">Headquarters</dt>
                  <dd className="font-medium text-gray-900 dark:text-white">{council.headquarters}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-500 dark:text-gray-400">Area</dt>
                  <dd className="font-medium text-gray-900 dark:text-white">{council.area_km2.toLocaleString()} km²</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-500 dark:text-gray-400">Population</dt>
                  <dd className="font-medium text-gray-900 dark:text-white">{council.population.toLocaleString()}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-500 dark:text-gray-400">Region</dt>
                  <dd className="font-medium text-gray-900 dark:text-white">
                    <Link href={`/shuleni/region/${council.region.slug}`} className="hover:text-green-600 dark:hover:text-green-400">
                      {council.region.name}
                    </Link>
                  </dd>
                </div>
              </dl>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
