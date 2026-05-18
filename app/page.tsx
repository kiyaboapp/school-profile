/**
 * Shuleni Homepage - Main landing page
 */

import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Shuleni - Tanzania School Selections & Education Data Platform',
  description: 'Comprehensive platform for Tanzania school selections data. View O-Level and A-Level student allocations, geographic distribution, combination statistics, and school-to-school flows for all regions, councils, and schools.',
  keywords: ['Tanzania education', 'NECTA selections', 'school statistics', 'A-Level allocations', 'O-Level results', 'education data'],
};

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      {/* Hero Section */}
      <header className="bg-gradient-to-r from-blue-600 to-indigo-700 dark:from-blue-800 dark:to-indigo-900 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-6">Shuleni</h1>
          <p className="text-2xl opacity-90 mb-8 max-w-3xl mx-auto">
            Tanzania's Comprehensive School Selections Data Platform
          </p>
          <p className="text-lg opacity-80 mb-12 max-w-2xl mx-auto">
            Explore detailed student allocation data, geographic distributions, combination statistics, 
            and school performance metrics across all regions, councils, and schools in Tanzania.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link 
              href="/shuleni/selections/2024"
              className="bg-white text-blue-600 px-8 py-4 rounded-full font-bold text-lg hover:bg-blue-50 transition-colors shadow-lg"
            >
              Browse 2024 Selections
            </Link>
            <Link 
              href="/shuleni/comb"
              className="bg-blue-500 text-white px-8 py-4 rounded-full font-bold text-lg hover:bg-blue-400 transition-colors shadow-lg"
            >
              Explore Combinations
            </Link>
          </div>
        </div>
      </header>

      {/* Features Grid */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          <FeatureCard
            icon="🏫"
            title="School Profiles"
            description="Detailed selection data for every secondary school in Tanzania, including outgoing O-Level and incoming A-Level students."
            link="/shuleni/school/example-school/selections/2024"
            linkText="View Example"
          />
          <FeatureCard
            icon="📊"
            title="National Statistics"
            description="Nationwide overview of student allocations, top combinations, and leading schools by incoming/outgoing students."
            link="/shuleni/selections/2024"
            linkText="View National Data"
          />
          <FeatureCard
            icon="🎓"
            title="Combinations"
            description="Explore A-Level combinations, subject requirements, career pathways, and schools offering each combination."
            link="/shuleni/comb/pcm"
            linkText="Browse Combinations"
          />
          <FeatureCard
            icon="🗺️"
            title="Regional Data"
            description="Breakdown by region and council with localized statistics and school performance metrics."
            link="/shuleni/region/dar-es-salaam/selections/2024"
            linkText="View Regional Data"
          />
          <FeatureCard
            icon="🔄"
            title="Student Flows"
            description="Track student movement between schools with detailed flow statistics and migration patterns."
            link="/shuleni/flows/2024"
            linkText="View Flow Data"
          />
          <FeatureCard
            icon="📈"
            title="Geographic Analysis"
            description="Understand how students are distributed across wards, councils, and regions with visual breakdowns."
            link="#"
            linkText="Learn More"
          />
        </div>

        {/* Stats Section */}
        <section className="mt-20 bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-12">
          <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-12">
            Platform Coverage
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <StatItem number="100,000+" label="School Pages" />
            <StatItem number="31" label="Regions" />
            <StatItem number="184" label="Councils" />
            <StatItem number="50+" label="Combinations" />
          </div>
        </section>

        {/* CTA Section */}
        <section className="mt-20 text-center">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
            Ready to Explore Tanzania's Education Data?
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 mb-8 max-w-2xl mx-auto">
            Access comprehensive selections data for any school, region, or combination. 
            All data is sourced from official NECTA records and updated annually.
          </p>
          <Link 
            href="/shuleni/selections/2024"
            className="inline-block bg-blue-600 text-white px-10 py-4 rounded-full font-bold text-lg hover:bg-blue-500 transition-colors shadow-lg"
          >
            Start Exploring Now
          </Link>
        </section>
      </main>

      {/* Footer */}
      <footer className="mt-20 bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-4">Shuleni</h3>
              <p className="text-gray-400">
                Tanzania's most comprehensive school selections data platform.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/shuleni/selections/2024" className="hover:text-white">National Selections</Link></li>
                <li><Link href="/shuleni/comb" className="hover:text-white">Combinations</Link></li>
                <li><Link href="/shuleni/flows/2024" className="hover:text-white">Student Flows</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Data Source</h4>
              <p className="text-gray-400 text-sm">
                All data sourced from NECTA (National Examinations Council of Tanzania) and Ministry of Education records.
              </p>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-gray-800 text-center text-gray-400 text-sm">
            © {new Date().getFullYear()} Shuleni. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description, link, linkText }: {
  icon: string;
  title: string;
  description: string;
  link: string;
  linkText: string;
}) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
      <div className="text-4xl mb-4">{icon}</div>
      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">{title}</h3>
      <p className="text-gray-600 dark:text-gray-400 mb-4">{description}</p>
      <Link href={link} className="text-blue-600 dark:text-blue-400 font-semibold hover:underline">
        {linkText} →
      </Link>
    </div>
  );
}

function StatItem({ number, label }: { number: string; label: string }) {
  return (
    <div className="text-center">
      <div className="text-4xl font-bold text-blue-600 dark:text-blue-400 mb-2">{number}</div>
      <div className="text-gray-600 dark:text-gray-400">{label}</div>
    </div>
  );
}
