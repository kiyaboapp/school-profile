import { SchoolSummaryStats, SchoolDetail, CombDetail } from './types';

export interface SeoProps {
  title: string;
  description: string;
  canonicalUrl: string;
  type?: 'website' | 'article';
  schoolData?: SchoolDetail & { stats?: SchoolSummaryStats };
  combData?: CombDetail;
}

export function generateJsonLd({ title, description, canonicalUrl, schoolData, combData }: SeoProps) {
  if (schoolData) {
    return {
      '@context': 'https://schema.org',
      '@type': 'EducationalOrganization',
      name: schoolData.name,
      description: description,
      url: canonicalUrl,
      address: {
        '@type': 'PostalAddress',
        addressLocality: schoolData.council_name,
        addressRegion: schoolData.region_name,
        addressCountry: 'TZ',
      },
      knowsAbout: [
        'Form Four Selections',
        'NECTA Results',
        'Secondary Education Tanzania',
        ...(schoolData.stats?.top_combinations || []).map(c => c.combination_code)
      ],
      aggregateRating: schoolData.stats ? {
        '@type': 'AggregateRating',
        ratingValue: Math.round((schoolData.stats.div_one_rate || 0) * 10).toString(),
        bestRating: '10',
        worstRating: '0',
        reviewCount: schoolData.stats.total_selected || 0
      } : undefined
    };
  }

  if (combData) {
    return {
      '@context': 'https://schema.org',
      '@type': 'Course',
      name: `${combData.code} - ${combData.name}`,
      description: `Analysis of ${combData.name} combination performance across Tanzania. Includes subjects: ${combData.subjects.join(', ')}.`,
      url: canonicalUrl,
      educationalCredentialAwarded: 'Advanced Certificate of Secondary Education Examination (ACSEE)',
      hasCourseInstance: {
        '@type': 'CourseInstance',
        courseMode: 'Full-time',
        courseWorkload: 'P0Y2M', // 2 Years
      }
    };
  }

  return {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: title,
    description: description,
    url: canonicalUrl
  };
}

export function generateMetaTags(props: SeoProps) {
  const { title, description, canonicalUrl } = props;
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      type: 'website',
      siteName: 'ShuleYetu',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
    alternates: {
      canonical: canonicalUrl,
    },
  };
}
