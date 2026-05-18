/**
 * ShuleYetu TypeScript Types
 * Mirrors the SQLAlchemy models from selections.py, school.py, pathways.py, models.py
 */

// ==================== GEOGRAPHIC TYPES ====================

export interface Region {
  region_id: number;
  region_name: string;
  slug?: string;
}

export interface Council {
  council_id: number;
  council_name: string;
  region_id: number;
  slug?: string;
}

export interface Ward {
  ward_id: number;
  ward_name: string;
  council_id: number;
  slug?: string;
}

export interface VillageStreet {
  village_street_id: number;
  village_street_name: string;
  ward_id: number;
}

// ==================== SCHOOL TYPES ====================

export type SchoolType = 'GOVERNMENT' | 'PRIVATE' | 'UNKNOWN';
export type AccommodationType = 'BOARDING' | 'DAY' | 'BOARDING AND DAY' | 'BWENI' | 'KUTWA' | null;

export interface School {
  centre_number: string;
  school_name: string;
  reg_number: string | null;
  registration_date: string | null; // ISO date
  slug: string | null;
  school_level: string | null;
  school_website: string | null;
  
  school_type: SchoolType;
  ownership: string | null;
  ownership_category: string | null;
  school_ownership: string | null;
  
  region_id: number | null;
  council_id: number | null;
  ward_id: number | null;
  village_street_id: number | null;
  latitude: number | null;
  longitude: number | null;
  school_address: string | null;
  location_details: string | null;
  
  accomodation: AccommodationType;
  is_boarding: boolean;
  is_day: boolean;
  
  is_olevel: boolean;
  is_alevel: boolean;
  is_primary: boolean;
  is_vocational: boolean;
  is_technical: boolean;
  is_special: boolean;
  is_inclusive: boolean;
  is_new_curriculum: boolean;
  is_religious: boolean;
  is_private_centre: boolean;
  is_inactive: boolean;
  
  is_olevel_boarding: boolean;
  is_alevel_boarding: boolean;
  is_olevel_girls: boolean;
  is_alevel_girls: boolean;
  is_olevel_boys: boolean;
  is_alevel_boys: boolean;
  is_mixture: boolean;
  is_unisex: boolean;
  
  // Relationships (populated via joins)
  region?: Region;
  council?: Council;
  ward?: Ward;
}

// ==================== NECTA RESULTS TYPES ====================

export interface NectaSchoolRank {
  id: number;
  centre_number: string;
  exam_year: number;
  exam_type: string;
  registered: number;
  sat: number;
  passed: number;
  school_gpa: number | null;
  school_average: number | null;
  ranking: {
    national?: { pos: number; out_of: number };
    regional?: { pos: number; out_of: number };
    council?: { pos: number; out_of: number };
  };
}

export interface NectaResultAnalysis {
  id: number;
  centre_number: string;
  exam_year: number;
  exam_type: string;
  analysis: {
    division_1?: number;
    division_2?: number;
    division_3?: number;
    division_4?: number;
    division_0?: number;
    total_registered?: number;
    total_sat?: number;
    total_passed?: number;
  };
}

export interface NectaSubjectRank {
  id: number;
  school_analysis_id: number;
  centre_number: string;
  subject_code: string;
  subject_name: string;
  subject_gpa: number | null;
  passed: number | null;
  registered: number | null;
  exam_year: number;
  exam_type: string;
}

// ==================== SELECTIONS TYPES (from selections.py) ====================

/**
 * SchoolFlowStats - Student flow from one school to another
 * Covers both PSLE (primary→O-Level) and CSEE (O-Level→A-Level school)
 */
export interface SchoolFlowStats {
  id: number;
  origin_centre_number: string;
  destination_centre_number: string;
  cycle_year: number;
  student_count: number;
  female_count: number;
  male_count: number;
  
  origin_school?: School;
  destination_school?: School;
}

/**
 * SchoolCombStats - A-Level combination allocations
 * Which combination students from origin school received at destination school
 */
export interface SchoolCombStats {
  id: number;
  origin_centre_number: string;
  destination_centre_number: string;
  comb_code: string;
  cycle_year: number;
  student_count: number;
  female_count: number;
  male_count: number;
  
  origin_school?: School;
  destination_school?: School;
}

/**
 * SchoolCourseStats - College/course allocations
 * Students placed at colleges (separate from A-Level school placements)
 */
export interface SchoolCourseStats {
  id: number;
  origin_centre_number: string;
  college_id: number | null;
  course_slug: string;
  course_name: string;
  cycle_year: number;
  student_count: number;
  female_count: number;
  male_count: number;
  
  origin_school?: School;
  destination_college?: NectaCollege;
}

/**
 * CombStats - Combination aggregates at 4 geographic granularities
 * Granularity determined by which location fields are NULL:
 * - All NULL → national
 * - region_id SET → regional
 * - region_id + council_id SET → council
 * - all three SET → ward
 */
export interface CombStats {
  id: number;
  comb_code: string;
  cycle_year: number;
  
  region_id: number | null;
  council_id: number | null;
  ward_id: number | null;
  
  total_placed: number;
  female_count: number;
  male_count: number;
  schools_receiving: number;
  schools_originating: number;
  
  region?: Region;
  council?: Council;
  ward?: Ward;
}

/**
 * SchoolSummaryStats - Per-school per-year selections summary
 * This is the main source for geographic scope data (KATA/MKOFA aggregation)
 */
export interface SchoolSummaryStats {
  id: number;
  centre_number: string;
  cycle_year: number;
  
  // Outgoing
  outgoing_total: number;
  outgoing_female: number;
  outgoing_male: number;
  outgoing_alevel: number;
  outgoing_college: number;
  outgoing_day: number;
  outgoing_boarding: number;
  
  // Geographic scope (aggregated from KATA/MKOA raw values during import)
  outgoing_ward_scope: number;      // KATA → same ward
  outgoing_council_scope: number;   // same council (derived at import)
  outgoing_regional_scope: number;  // MKOA → same region
  
  outgoing_destinations: number;
  
  // Incoming
  incoming_total: number;
  incoming_female: number;
  incoming_male: number;
  incoming_origins: number;
  
  school?: School;
}

// ==================== PATHWAYS TYPES (combinations, trades, courses) ====================

export interface NectaSpecialization {
  id: number;
  name: string;
  slug: string;
  description: string | null;
}

export interface NectaComb {
  id: number;
  code: string;
  name: string;
  slug: string;
  description: string | null;
  career_pathways: string | null;
  specialization_id: number | null;
  
  specialization?: NectaSpecialization;
  comb_subjects?: NectaCombSubject[];
}

export interface NectaCombSubject {
  id: number;
  comb_id: number;
  subject_code: string;
  subject_name: string;
  subject_slug: string;
  sort_order: number;
}

export interface NectaTrade {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  career_prospects: string | null;
  exam_type: string;
  specialization_id: number | null;
  
  specialization?: NectaSpecialization;
}

export interface NectaCollege {
  id: number;
  name: string;
  slug: string;
  short_name: string | null;
  description: string | null;
  college_type: string;
  region_id: number | null;
  website: string | null;
  is_active: boolean;
  
  region?: Region;
  courses?: NectaCourse[];
}

export interface NectaCourse {
  id: number;
  college_id: number;
  name: string;
  slug: string;
  description: string | null;
  duration_years: number | null;
  specialization_id: number | null;
  
  college?: NectaCollege;
}

// ==================== UTILITY TYPES ====================

export interface YearSelectorProps {
  currentYear: number;
  availableYears: number[];
  baseUrl: string;
}

export interface BreadcrumbItem {
  label: string;
  href: string;
}

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  baseUrl: string;
}

// Geographic scope breakdown (derived from SchoolSummaryStats)
export interface GeographicScopeBreakdown {
  ward: number;      // outgoing_ward_scope (KATA)
  council: number;   // outgoing_council_scope
  regional: number;  // outgoing_regional_scope (MKOA)
  outsideRegion: number; // derived: outgoing_alevel - ward - council - regional
  totalAlevel: number;
}

// Boarding vs Day breakdown
export interface BoardingDayBreakdown {
  boarding: number;
  day: number;
  total: number;
  boardingRate: number;
}
