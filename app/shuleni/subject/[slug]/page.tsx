import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { BookOpen, Users, TrendingUp, School, ChevronRight, Award, Target } from 'lucide-react';

// Mock data fetcher - Replace with actual API call
async function getSubjectData(slug: string) {
  // TODO: Replace with fetch(`http://localhost:8000/api/subjects/${slug}`)
  return {
    id: 'subj_001',
    name: 'Mathematics',
    slug: 'mathematics',
    code: '141',
    category: 'Core',
    level: 'Both O & A Level',
    description: 'Mathematics is a fundamental subject that develops logical thinking, problem-solving skills, and quantitative reasoning. It is essential for many career paths in science, engineering, business, and technology.',
    total_students: 125000,
    schools_offering: 1850,
    pass_rate: 72.3,
    average_grade: 'C+',
    topics: [
      'Algebra',
      'Geometry',
      'Calculus',
      'Statistics',
      'Trigonometry',
      'Number Theory'
    ],
    combinations: [
      { name: 'Physics, Chemistry, Mathematics', slug: 'physics-chemistry-mathematics', code: 'PCM' },
      { name: 'Mathematics, Economics, Geography', slug: 'mathematics-economics-geography', code: 'MEG' },
      { name: 'Mathematics, Biology, Chemistry', slug: 'mathematics-biology-chemistry', code: 'MBC' },
    ],
    career_relevance: [
      'Engineering',
      'Computer Science',
      'Economics',
      'Accounting',
      'Data Science',
      'Architecture',
      'Physics'
    ]
  };
}

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const subject = await getSubjectData(slug);
  
  if (!subject) {
    return { title: 'Subject Not Found' };
  }

  return {
    title: `${subject.name} (${subject.code}) | ShuleYetu`,
    description: `Complete information about ${subject.name} subject including topics, statistics, and related combinations.`,
    openGraph: {
      title: `${subject.name} - ShuleYetu`,
      description: `${subject.schools_offering} schools offering this subject. Pass rate: ${subject.pass_rate}%`,
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${subject.name}`,
      description: `Subject details and statistics.`,
    },
  };
}

export default async function SubjectProfilePage({ params }: PageProps) {
  const { slug } = await params;
  const subject = await getSubjectData(slug);

  if (!subject) {
    notFound();
  }

  const breadcrumbs = [
    { label: 'Home', href: '/' },
    { label: 'Subjects', href: '/shuleni/subjects' },
    { label: subject.name, href: `/shuleni/subject/${subject.slug}` },
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
          <div className="relative h-48 bg-gradient-to-r from-orange-600 to-red-700">
            <div className="absolute inset-0 bg-black/20"></div>
            <div className="absolute bottom-0 left-0 p-6">
              <div className="flex items-center space-x-2 text-orange-100 mb-2">
                <BookOpen className="w-5 h-5" />
                <span className="text-sm font-medium">{subject.category} • {subject.level}</span>
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-white">{subject.name}</h1>
              <p className="text-orange-100 mt-1">Code: {subject.code}</p>
            </div>
          </div>
          
          <div className="p-6">
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
              {subject.description}
            </p>
            
            <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
                <div className="flex items-center space-x-2 text-gray-500 dark:text-gray-400 mb-1">
                  <School className="w-4 h-4" />
                  <span className="text-xs font-medium">Schools</span>
                </div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{subject.schools_offering.toLocaleString()}</p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
                <div className="flex items-center space-x-2 text-gray-500 dark:text-gray-400 mb-1">
                  <Users className="w-4 h-4" />
                  <span className="text-xs font-medium">Students</span>
                </div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{subject.total_students.toLocaleString()}</p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
                <div className="flex items-center space-x-2 text-gray-500 dark:text-gray-400 mb-1">
                  <TrendingUp className="w-4 h-4" />
                  <span className="text-xs font-medium">Pass Rate</span>
                </div>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">{subject.pass_rate}%</p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
                <div className="flex items-center space-x-2 text-gray-500 dark:text-gray-400 mb-1">
                  <Award className="w-4 h-4" />
                  <span className="text-xs font-medium">Avg Grade</span>
                </div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{subject.average_grade}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Topics */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center">
                <Target className="w-5 h-5 mr-2 text-orange-600" />
                Key Topics
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {subject.topics.map((topic, idx) => (
                  <div 
                    key={idx}
                    className="p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg text-center"
                  >
                    <p className="text-sm font-medium text-orange-700 dark:text-orange-300">{topic}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Related Combinations */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center">
                <BookOpen className="w-5 h-5 mr-2 text-orange-600" />
                Related Combinations
              </h2>
              <div className="space-y-3">
                {subject.combinations.map((comb, idx) => (
                  <Link
                    key={idx}
                    href={`/shuleni/comb/${comb.slug}`}
                    className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  >
                    <div className="flex items-center space-x-3">
                      <span className="flex items-center justify-center w-10 h-10 rounded-full bg-orange-100 dark:bg-orange-900 text-orange-600 dark:text-orange-300 text-sm font-bold">
                        {comb.code}
                      </span>
                      <span className="font-medium text-gray-900 dark:text-white">{comb.name}</span>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-400" />
                  </Link>
                ))}
              </div>
            </div>

            {/* Career Relevance */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center">
                <TrendingUp className="w-5 h-5 mr-2 text-orange-600" />
                Career Relevance
              </h2>
              <div className="flex flex-wrap gap-2">
                {subject.career_relevance.map((career, idx) => (
                  <span 
                    key={idx}
                    className="px-3 py-1.5 bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-300 rounded-lg text-sm font-medium"
                  >
                    {career}
                  </span>
                ))}
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
                  href={`/shuleni/schools?subject=${subject.slug}`}
                  className="block w-full px-4 py-2.5 bg-orange-600 hover:bg-orange-700 text-white rounded-lg text-center font-medium transition-colors"
                >
                  Find Schools Offering This
                </Link>
                <Link
                  href={`/shuleni/results?subject=${subject.slug}`}
                  className="block w-full px-4 py-2.5 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-lg text-center font-medium transition-colors"
                >
                  View Results by Subject
                </Link>
              </div>
            </div>

            {/* Subject Details */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Details</h3>
              <dl className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <dt className="text-gray-500 dark:text-gray-400">Code</dt>
                  <dd className="font-medium text-gray-900 dark:text-white">{subject.code}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-500 dark:text-gray-400">Category</dt>
                  <dd className="font-medium text-gray-900 dark:text-white">{subject.category}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-500 dark:text-gray-400">Level</dt>
                  <dd className="font-medium text-gray-900 dark:text-white">{subject.level}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-500 dark:text-gray-400">Pass Rate</dt>
                  <dd className="font-medium text-green-600 dark:text-green-400">{subject.pass_rate}%</dd>
                </div>
              </dl>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
