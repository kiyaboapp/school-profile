/**
 * School Profile Page - /shuleni/school/[slug]
 * Comprehensive, SEO-optimized page displaying complete school information
 */

import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getSchoolBySlug } from '@/lib/api';
import { formatNumber } from '@/lib/utils';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  
  // Fetch minimal data for metadata
  const school = await getSchoolBySlug(slug);
  
  const schoolName = school?.school_name || slug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  const location = school?.region ? `${school.council?.council_name || ''}, ${school.region.region_name}` : 'Tanzania';
  
  return {
    title: `${schoolName} - Complete School Profile | Shuleni`,
    description: `Comprehensive profile of ${schoolName} located in ${location}. View school details, contact information, facilities, academic programs, exam results, and student selections data.`,
    keywords: [
      schoolName,
      'school profile',
      'Tanzania schools',
      'NECTA results',
      school.region?.region_name || '',
      school.council?.council_name || '',
      'education Tanzania',
      school.school_type || '',
      school.accomodation || '',
    ].filter(Boolean),
    openGraph: {
      title: `${schoolName} - School Profile`,
      description: `Complete school information including location, facilities, academic programs, and performance data`,
      type: 'website',
      locale: 'en_TZ',
    },
    twitter: {
      card: 'summary_large_image',
      title: schoolName,
      description: `View complete profile of ${schoolName}`,
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
  };
}

export default async function SchoolProfilePage({ params }: PageProps) {
  const { slug } = await params;
  
  const school = await getSchoolBySlug(slug);
  
  if (!school) {
    notFound();
  }

  const wardName = school.ward?.ward_name;
  const councilName = school.council?.council_name;
  const regionName = school.region?.region_name;

  // Helper to check if any education level is active
  const hasEducationLevels = [
    school.is_primary,
    school.is_olevel,
    school.is_alevel,
    school.is_vocational,
    school.is_technical,
    school.is_pre,
  ].some(Boolean);

  // Helper to format boolean flags as Yes/No
  const yesNo = (value: boolean | null) => value ? 'Yes' : 'No';

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Hero Section */}
      <header className="bg-gradient-to-r from-blue-600 to-indigo-700 dark:from-blue-800 dark:to-indigo-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex items-start justify-between">
            <div>
              <nav className="text-sm mb-4 opacity-80">
                <ol className="flex items-center space-x-2">
                  <li><a href="/shuleni" className="hover:underline">Home</a></li>
                  <li>/</li>
                  {regionName && (
                    <>
                      <li><a href={`/shuleni/region/${regionName.toLowerCase().replace(/\s+/g, '-')}`} className="hover:underline">{regionName}</a></li>
                      <li>/</li>
                    </>
                  )}
                  {councilName && (
                    <>
                      <li><a href={`/shuleni/council/${councilName.toLowerCase().replace(/\s+/g, '-')}`} className="hover:underline">{councilName}</a></li>
                      <li>/</li>
                    </>
                  )}
                  <li className="font-semibold">{school.school_name}</li>
                </ol>
              </nav>
              
              <h1 className="text-4xl md:text-5xl font-bold mb-2">{school.school_name}</h1>
              <p className="text-xl opacity-90 mb-4">
                {wardName && `${wardName}, `}{councilName && `${councilName}, `}{regionName}
              </p>
              <div className="flex flex-wrap items-center gap-3">
                <span className="bg-white/20 px-4 py-2 rounded-full text-sm">
                  {school.school_type === 'GOVERNMENT' ? 'Government' : school.school_type === 'PRIVATE' ? 'Private' : school.school_type}
                </span>
                {school.accomodation && (
                  <span className="bg-white/20 px-4 py-2 rounded-full text-sm">
                    {school.accomodation.replace(/ AND /g, '/')}
                  </span>
                )}
                {school.is_inactive && (
                  <span className="bg-red-500/80 px-4 py-2 rounded-full text-sm">
                    Inactive
                  </span>
                )}
              </div>
            </div>
            
            {school.latitude && school.longitude && (
              <div className="hidden md:block text-right">
                <div className="text-sm opacity-80">Coordinates</div>
                <div className="text-lg font-mono">{school.latitude.toFixed(4)}, {school.longitude.toFixed(4)}</div>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content - Left Column */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Basic Information */}
            <section className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
                <span className="mr-3">🏫</span>
                Basic Information
              </h2>
              <dl className="grid md:grid-cols-2 gap-6">
                <div>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Centre Number</dt>
                  <dd className="text-lg font-semibold text-gray-900 dark:text-white">{school.centre_number}</dd>
                </div>
                {school.reg_number && (
                  <div>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Registration Number</dt>
                    <dd className="text-lg font-semibold text-gray-900 dark:text-white">{school.reg_number}</dd>
                  </div>
                )}
                {school.registration_date && (
                  <div>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Registration Date</dt>
                    <dd className="text-lg font-semibold text-gray-900 dark:text-white">
                      {new Date(school.registration_date).toLocaleDateString()}
                    </dd>
                  </div>
                )}
                {school.school_level && (
                  <div>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">School Level</dt>
                    <dd className="text-lg font-semibold text-gray-900 dark:text-white">{school.school_level}</dd>
                  </div>
                )}
                {school.school_address && (
                  <div className="md:col-span-2">
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Postal Address</dt>
                    <dd className="text-lg text-gray-900 dark:text-white">{school.school_address}</dd>
                  </div>
                )}
                {school.location_details && (
                  <div className="md:col-span-2">
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Location Details</dt>
                    <dd className="text-lg text-gray-900 dark:text-white">{school.location_details}</dd>
                  </div>
                )}
              </dl>
            </section>

            {/* Education Levels */}
            {hasEducationLevels && (
              <section className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
                  <span className="mr-3">📚</span>
                  Education Levels & Programs
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {school.is_primary && (
                    <LevelBadge 
                      label="Primary Education" 
                      icon="👶"
                      gender={school.is_primary_boys ? 'Boys' : school.is_primary_girls ? 'Girls' : 'Mixed'}
                    />
                  )}
                  {school.is_olevel && (
                    <LevelBadge 
                      label="O-Level (Form 1-4)" 
                      icon="🎓"
                      gender={school.is_olevel_boys ? 'Boys' : school.is_olevel_girls ? 'Girls' : 'Mixed'}
                      boarding={school.is_olevel_boarding}
                    />
                  )}
                  {school.is_alevel && (
                    <LevelBadge 
                      label="A-Level (Form 5-6)" 
                      icon="📖"
                      gender={school.is_alevel_boys ? 'Boys' : school.is_alevel_girls ? 'Girls' : 'Mixed'}
                      boarding={school.is_alevel_boarding}
                    />
                  )}
                  {school.is_vocational && (
                    <LevelBadge label="Vocational Training" icon="🛠️" />
                  )}
                  {school.is_technical && (
                    <LevelBadge label="Technical Education" icon="⚙️" />
                  )}
                  {school.is_pre && (
                    <LevelBadge label="Pre-Primary" icon="🧒" />
                  )}
                  {school.is_special && (
                    <LevelBadge label="Special Needs Education" icon="♿" />
                  )}
                  {school.is_new_curriculum && (
                    <LevelBadge label="New Curriculum (CBE)" icon="✨" />
                  )}
                  {school.is_religious && (
                    <LevelBadge label="Religious Education" icon="🕌⛪" />
                  )}
                </div>
              </section>
            )}

            {/* Gender & Boarding */}
            <section className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
                <span className="mr-3">👥</span>
                Gender Composition & Boarding
              </h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="font-semibold text-gray-700 dark:text-gray-300">Gender</h3>
                  <div className="flex flex-wrap gap-2">
                    {school.is_unisex && (
                      <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-400 rounded-full text-sm">
                        Unisex
                      </span>
                    )}
                    {school.is_mixture && (
                      <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400 rounded-full text-sm">
                        Mixed
                      </span>
                    )}
                    {!school.is_unisex && !school.is_mixture && (
                      <span className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-400 rounded-full text-sm">
                        Single Gender
                      </span>
                    )}
                  </div>
                </div>
                <div className="space-y-4">
                  <h3 className="font-semibold text-gray-700 dark:text-gray-300">Boarding Facilities</h3>
                  <div className="flex flex-wrap gap-2">
                    {school.accomodation && (
                      <span className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400 rounded-full text-sm">
                        {school.accomodation}
                      </span>
                    )}
                    {school.is_boarding && (
                      <span className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400 rounded-full text-sm">
                        Boarding Available
                      </span>
                    )}
                    {school.is_day && (
                      <span className="px-3 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400 rounded-full text-sm">
                        Day School
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </section>

            {/* Ownership & Category */}
            <section className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
                <span className="mr-3">🏛️</span>
                Ownership & Category
              </h2>
              <dl className="grid md:grid-cols-2 gap-6">
                {school.ownership && (
                  <div>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Ownership</dt>
                    <dd className="text-lg font-semibold text-gray-900 dark:text-white">{school.ownership}</dd>
                  </div>
                )}
                {school.school_ownership && (
                  <div>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">School Ownership</dt>
                    <dd className="text-lg text-gray-900 dark:text-white">{school.school_ownership}</dd>
                  </div>
                )}
                {school.ownership_category && (
                  <div>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Ownership Category</dt>
                    <dd className="text-lg text-gray-900 dark:text-white">{school.ownership_category}</dd>
                  </div>
                )}
                {school.school_category && (
                  <div>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Category</dt>
                    <dd className="text-lg text-gray-900 dark:text-white">
                      <span className={`inline-block px-3 py-1 rounded-full text-sm ${
                        school.school_category === 'Special need' 
                          ? 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400'
                          : school.school_category === 'Inclusive'
                          ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400'
                          : 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400'
                      }`}>
                        {school.school_category}
                      </span>
                    </dd>
                  </div>
                )}
                {school.is_inclusive !== null && (
                  <div>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Inclusive Education</dt>
                    <dd className="text-lg text-gray-900 dark:text-white">
                      {school.is_inclusive 
                        ? <span className="text-green-600 dark:text-green-400">✓ Accepts disabled students</span>
                        : <span className="text-gray-500">Not specified</span>
                      }
                    </dd>
                  </div>
                )}
                {school.is_private_centre !== null && (
                  <div>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Private Examination Centre</dt>
                    <dd className="text-lg text-gray-900 dark:text-white">
                      {yesNo(school.is_private_centre)}
                    </dd>
                  </div>
                )}
              </dl>
            </section>

            {/* Contact & Web Presence */}
            {(school.school_website || school.latitude) && (
              <section className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
                  <span className="mr-3">🌐</span>
                  Contact & Online Presence
                </h2>
                <div className="space-y-4">
                  {school.school_website && (
                    <div>
                      <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Official Website</dt>
                      <a 
                        href={school.school_website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 dark:text-blue-400 hover:underline break-all"
                      >
                        {school.school_website}
                      </a>
                    </div>
                  )}
                  {school.latitude && school.longitude && (
                    <div>
                      <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Location on Map</dt>
                      <div className="aspect-video w-full rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700">
                        <iframe
                          width="100%"
                          height="100%"
                          style={{ border: 0 }}
                          loading="lazy"
                          allowFullScreen
                          referrerPolicy="no-referrer-when-downgrade"
                          src={`https://www.google.com/maps?q=${school.latitude},${school.longitude}&hl=en&z=14&output=embed`}
                          title="School Location Map"
                        />
                      </div>
                      <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                        Latitude: {school.latitude.toFixed(6)}, Longitude: {school.longitude.toFixed(6)}
                      </p>
                    </div>
                  )}
                </div>
              </section>
            )}

            {/* Additional Flags */}
            <section className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
                <span className="mr-3">ℹ️</span>
                Additional Information
              </h2>
              <dl className="grid md:grid-cols-2 gap-6">
                {school.is_inactive !== null && (
                  <div>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Status</dt>
                    <dd className="text-lg">
                      {school.is_inactive 
                        ? <span className="text-red-600 dark:text-red-400 font-semibold">Inactive</span>
                        : <span className="text-green-600 dark:text-green-400 font-semibold">Active</span>
                      }
                    </dd>
                  </div>
                )}
              </dl>
            </section>

          </div>

          {/* Sidebar - Right Column */}
          <div className="space-y-6">
            
            {/* Quick Actions */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <a
                  href={`/shuleni/school/${slug}/selections/2024`}
                  className="block w-full text-center px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                >
                  📊 View Selections Data
                </a>
                <a
                  href={`/shuleni/region/${regionName?.toLowerCase().replace(/\s+/g, '-') || '#'}`}
                  className="block w-full text-center px-4 py-3 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-900 dark:text-white rounded-lg font-medium transition-colors"
                >
                  🗺️ Browse {regionName || 'Region'}
                </a>
                <a
                  href={`/shuleni/council/${councilName?.toLowerCase().replace(/\s+/g, '-') || '#'}`}
                  className="block w-full text-center px-4 py-3 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-900 dark:text-white rounded-lg font-medium transition-colors"
                >
                  🏛️ Browse {councilName || 'Council'}
                </a>
              </div>
            </div>

            {/* Location Hierarchy */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Location Hierarchy</h3>
              <div className="space-y-3">
                {regionName && (
                  <LocationItem 
                    icon="🌍"
                    label="Region"
                    name={regionName}
                    href={`/shuleni/region/${regionName.toLowerCase().replace(/\s+/g, '-')}`}
                  />
                )}
                {councilName && (
                  <LocationItem 
                    icon="🏛️"
                    label="Council"
                    name={councilName}
                    href={`/shuleni/council/${councilName.toLowerCase().replace(/\s+/g, '-')}`}
                  />
                )}
                {wardName && (
                  <LocationItem 
                    icon="📍"
                    label="Ward"
                    name={wardName}
                    href={`/shuleni/ward/${wardName.toLowerCase().replace(/\s+/g, '-')}`}
                  />
                )}
              </div>
            </div>

            {/* School Stats Placeholder */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl shadow-lg p-6 border border-blue-100 dark:border-blue-800">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">📈 Performance Data</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                NECTA exam results and academic performance metrics will be displayed here once available.
              </p>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Latest Results:</span>
                  <span className="font-medium text-gray-900 dark:text-white">Coming Soon</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">National Rank:</span>
                  <span className="font-medium text-gray-900 dark:text-white">-</span>
                </div>
              </div>
            </div>

            {/* Share */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Share This School</h3>
              <div className="flex gap-2">
                <button className="flex-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors">
                  Facebook
                </button>
                <button className="flex-1 px-3 py-2 bg-sky-500 hover:bg-sky-600 text-white rounded-lg text-sm font-medium transition-colors">
                  Twitter
                </button>
                <button className="flex-1 px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-colors">
                  WhatsApp
                </button>
              </div>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}

// Component: Education Level Badge
function LevelBadge({ 
  label, 
  icon, 
  gender, 
  boarding 
}: { 
  label: string; 
  icon: string; 
  gender?: string;
  boarding?: boolean | null;
}) {
  return (
    <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600">
      <div className="flex items-center mb-2">
        <span className="text-2xl mr-2">{icon}</span>
        <span className="font-semibold text-gray-900 dark:text-white text-sm">{label}</span>
      </div>
      {gender && (
        <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
          {gender}
        </div>
      )}
      {boarding !== undefined && boarding !== null && (
        <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
          {boarding ? '🏠 Boarding' : '☀️ Day'}
        </div>
      )}
    </div>
  );
}

// Component: Location Item
function LocationItem({ 
  icon, 
  label, 
  name, 
  href 
}: { 
  icon: string; 
  label: string; 
  name: string; 
  href: string;
}) {
  return (
    <a 
      href={href}
      className="flex items-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors group"
    >
      <span className="text-xl mr-3">{icon}</span>
      <div className="flex-1 min-w-0">
        <div className="text-xs text-gray-500 dark:text-gray-400">{label}</div>
        <div className="font-medium text-gray-900 dark:text-white truncate group-hover:text-blue-600 dark:group-hover:text-blue-400">
          {name}
        </div>
      </div>
      <span className="text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400">→</span>
    </a>
  );
}
