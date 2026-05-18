import Link from 'next/link';
import { formatNumber, getGenderSplit } from '@/lib/utils';
import type { SchoolCourseStats } from '@/types';

interface CollegeDestinationsProps {
  courseStats: SchoolCourseStats[];
  year: number;
}

export function CollegeDestinations({ courseStats, year }: CollegeDestinationsProps) {
  // Group by college
  const grouped = courseStats.reduce((acc, stat) => {
    const collegeName = stat.destination_college?.name || 'College Unknown';
    const collegeSlug = stat.destination_college?.slug || '';
    
    if (!acc[collegeName]) {
      acc[collegeName] = { 
        slug: collegeSlug,
        total: 0, 
        female: 0, 
        male: 0, 
        courses: [] as any[] 
      };
    }
    acc[collegeName].total += stat.student_count;
    acc[collegeName].female += stat.female_count;
    acc[collegeName].male += stat.male_count;
    acc[collegeName].courses.push({
      courseName: stat.course_name,
      courseSlug: stat.course_slug,
      count: stat.student_count,
      female: stat.female_count,
      male: stat.male_count,
    });
    return acc;
  }, {} as Record<string, any>);

  // Sort by total descending
  const sortedColleges = Object.entries(grouped)
    .sort((a, b) => b[1].total - a[1].total);

  if (sortedColleges.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        Hakuna data ya vyuo kwa mwaka huu
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {sortedColleges.map(([collegeName, data]: any) => (
        <div key={collegeName} className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between mb-3">
            <Link 
              href={`/chuo/${data.slug}`}
              className="text-xl font-bold text-blue-600 hover:text-blue-700"
            >
              {collegeName}
            </Link>
            <div className="text-right">
              <div className="text-lg font-semibold text-gray-900">
                {formatNumber(data.total)} wanafunzi
              </div>
              <div className="text-sm text-gray-500">
                {getGenderSplit(data.female, data.male)}
              </div>
            </div>
          </div>

          <div className="border-t border-gray-100 pt-3">
            <h4 className="text-sm font-medium text-gray-700 mb-2">
              Kozi walizochaguliwa:
            </h4>
            <ul className="space-y-2">
              {data.courses
                .sort((a: any, b: any) => b.count - a.count)
                .map((course: any, idx: number) => (
                  <li key={idx} className="flex items-center justify-between text-sm">
                    <Link
                      href={`/kozi/${course.courseSlug}`}
                      className="text-gray-700 hover:text-blue-600 truncate flex-1"
                    >
                      {course.courseName}
                    </Link>
                    <span className="text-gray-900 font-medium ml-4">
                      {formatNumber(course.count)}
                    </span>
                  </li>
                ))}
            </ul>
          </div>
        </div>
      ))}
    </div>
  );
}
