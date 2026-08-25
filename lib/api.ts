/**
 * ShuleYetu API Client
 * Connects to FastAPI backend at /api/v1
 */

import type {
  School,
  SchoolSummaryStats,
  SchoolFlowStats,
  SchoolCombStats,
  SchoolCourseStats,
  CombStats,
  Region,
  Council,
  Ward,
  NectaSchoolRank,
  NectaResultAnalysis,
  NectaComb,
  NectaCollege,
  NectaCourse,
} from '@/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

// ==================== UTILITY FUNCTIONS ====================

async function fetchAPI<T>(endpoint: string): Promise<T | null> {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      cache: 'force-cache',
      next: { revalidate: 3600 }, // Revalidate every hour
    });
    
    if (!response.ok) {
      if (response.status === 404) return null;
      throw new Error(`API error: ${response.status}`);
    }
    
    return response.json();
  } catch (error) {
    console.error('API fetch error:', error);
    return null;
  }
}

// ==================== SCHOOL APIs ====================

export async function getSchoolBySlug(slug: string): Promise<School | null> {
  // Note: This would need a dedicated endpoint in the backend
  return fetchAPI<School>(`/schools/${slug}`);
}

export async function getSchoolSummaryStats(
  centreNumber: string,
  year: number
): Promise<SchoolSummaryStats | null> {
  return fetchAPI<SchoolSummaryStats>(`/selections/shule/${centreNumber}/${year}`);
}

export async function getSchoolFlowStats(
  centreNumber: string,
  year: number,
  direction: 'origin' | 'destination'
): Promise<SchoolFlowStats[]> {
  const endpoint = direction === 'origin' 
    ? `origin_centre_number=${centreNumber}`
    : `destination_centre_number=${centreNumber}`;
  return fetchAPI<SchoolFlowStats[]>(`/selections/mtiririko/${year}?${endpoint}&limit=50`) || [];
}

export async function getSchoolCombStats(
  centreNumber: string,
  year: number,
  direction: 'origin' | 'destination'
): Promise<SchoolCombStats[]> {
  const endpoint = direction === 'origin'
    ? `/selections/comb/ALL/shule-watoka?year=${year}&limit=50`
    : `/selections/comb/ALL/shule-zinazotoa?year=${year}&limit=50`;
  return fetchAPI<SchoolCombStats[]>(endpoint) || [];
}

export async function getSchoolCourseStats(
  centreNumber: string,
  year: number
): Promise<SchoolCourseStats[]> {
  return fetchAPI<SchoolCourseStats[]>(`/selections/courses?origin=${centreNumber}&year=${year}`) || [];
}

// ==================== RESULTS APIs ====================

export async function getSchoolResults(
  centreNumber: string,
  examType: string,
  year: number
): Promise<{ rank: NectaSchoolRank; analysis: NectaResultAnalysis } | null> {
  await delay(100);
  console.log('Fetching results:', centreNumber, examType, year);
  return null;
}

export async function getSubjectRanks(
  centreNumber: string,
  examType: string,
  year: number
): Promise<any[]> {
  await delay(100);
  console.log('Fetching subject ranks:', centreNumber, examType, year);
  return [];
}

// ==================== COMBINATION APIs ====================

export async function getCombBySlug(slug: string): Promise<NectaComb | null> {
  return fetchAPI<NectaComb>(`/selections/comb/${slug}`);
}

export async function getCombStatsNational(
  combCode: string,
  year?: number
): Promise<CombStats[]> {
  const yearParam = year ? `?year=${year}` : '';
  return fetchAPI<CombStats[]>(`/selections/comb/${combCode.toLowerCase()}/stats${yearParam}`) || [];
}

export async function getCombStatsByRegion(
  combCode: string,
  regionId: number,
  year?: number
): Promise<CombStats[]> {
  const yearParam = year ? `?year=${year}` : '';
  return fetchAPI<CombStats[]>(`/selections/comb/${combCode.toLowerCase()}/mkoa/${regionId}/stats${yearParam}`) || [];
}

export async function getCombStatsByCouncil(
  combCode: string,
  councilId: number,
  year?: number
): Promise<CombStats[]> {
  const yearParam = year ? `?year=${year}` : '';
  return fetchAPI<CombStats[]>(`/selections/comb/${combCode.toLowerCase()}/halmashauri/${councilId}/stats${yearParam}`) || [];
}

// ==================== GEOGRAPHIC APIs ====================

export async function getAllRegions(): Promise<Region[]> {
  return fetchAPI<Region[]>('/regions') || [];
}

export async function getRegionBySlug(slug: string): Promise<Region | null> {
  return fetchAPI<Region>(`/regions/${slug}`);
}

export async function getCouncilsByRegion(regionId: number): Promise<Council[]> {
  return fetchAPI<Council[]>(`/regions/${regionId}/councils`) || [];
}

export async function getCouncilBySlug(slug: string): Promise<Council | null> {
  return fetchAPI<Council>(`/councils/${slug}`);
}

export async function getWardsByCouncil(councilId: number): Promise<Ward[]> {
  return fetchAPI<Ward[]>(`/councils/${councilId}/wards`) || [];
}

export async function getWardBySlug(slug: string): Promise<Ward | null> {
  return fetchAPI<Ward>(`/wards/${slug}`);
}

// ==================== COLLEGE APIs ====================

export async function getAllColleges(): Promise<NectaCollege[]> {
  return fetchAPI<NectaCollege[]>('/colleges') || [];
}

export async function getCollegeBySlug(slug: string): Promise<NectaCollege | null> {
  return fetchAPI<NectaCollege>(`/colleges/${slug}`);
}

export async function getCourseBySlug(slug: string): Promise<NectaCourse | null> {
  return fetchAPI<NectaCourse>(`/courses/${slug}`);
}

// ==================== AGGREGATION APIs ====================

export async function getNationalSelectionsSummary(year: number): Promise<any> {
  return fetchAPI<any>(`/selections/uchaguzi/${year}/summary`);
}

export async function getTopCombinations(year: number, limit: number = 10): Promise<CombStats[]> {
  return fetchAPI<CombStats[]>(`/selections/uchaguzi/${year}/top-combinations?limit=${limit}`) || [];
}

export async function getTopIncomingSchools(year: number, limit: number = 10): Promise<SchoolSummaryStats[]> {
  return fetchAPI<SchoolSummaryStats[]>(`/selections/uchaguzi/${year}/top-incoming-schools?limit=${limit}`) || [];
}

export async function getTopOutgoingSchools(year: number, limit: number = 10): Promise<SchoolSummaryStats[]> {
  return fetchAPI<SchoolSummaryStats[]>(`/selections/uchaguzi/${year}/top-outgoing-schools?limit=${limit}`) || [];
}

export async function getSchoolFlows(year: number, limit: number = 50): Promise<SchoolFlowStats[]> {
  return fetchAPI<SchoolFlowStats[]>(`/selections/mtiririko/${year}?limit=${limit}`) || [];
}

// ==================== AVAILABLE YEARS ====================

export async function getAvailableYears(): Promise<number[]> {
  // In production, this could come from the API
  const currentYear = new Date().getFullYear();
  return [currentYear - 4, currentYear - 3, currentYear - 2, currentYear - 1, currentYear];
}
