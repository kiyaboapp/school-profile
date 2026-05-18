"""
Pydantic schemas for ShuleYetu API
Mirrors the SQLAlchemy models with proper serialization
"""
from pydantic import BaseModel, Field, computed_field
from typing import Optional, List, Dict, Any
from datetime import date, datetime


# ==================== GEOGRAPHIC SCHEMAS ====================

class RegionBase(BaseModel):
    region_name: str = Field(..., max_length=50)


class RegionCreate(RegionBase):
    pass


class RegionResponse(RegionBase):
    region_id: int
    slug: Optional[str] = None
    
    class Config:
        from_attributes = True


class CouncilBase(BaseModel):
    council_name: str = Field(..., max_length=50)
    region_id: int


class CouncilCreate(CouncilBase):
    pass


class CouncilResponse(CouncilBase):
    council_id: int
    region: Optional[RegionResponse] = None
    slug: Optional[str] = None
    
    class Config:
        from_attributes = True


class WardBase(BaseModel):
    ward_name: str = Field(..., max_length=100)
    council_id: int


class WardResponse(WardBase):
    ward_id: int
    council: Optional[CouncilResponse] = None
    slug: Optional[str] = None
    
    class Config:
        from_attributes = True


class VillageStreetBase(BaseModel):
    village_street_name: str = Field(..., max_length=200)
    ward_id: int


class VillageStreetResponse(VillageStreetBase):
    village_street_id: int
    
    class Config:
        from_attributes = True


# ==================== SCHOOL SCHEMAS ====================

class SchoolBase(BaseModel):
    school_name: str = Field(..., max_length=100)
    centre_number: str = Field(..., max_length=10)
    reg_number: Optional[str] = Field(None, max_length=50)
    registration_date: Optional[date] = None
    school_level: Optional[str] = Field(None, max_length=100)
    school_website: Optional[str] = Field(None, max_length=500)
    
    school_type: str = Field(..., pattern="^(GOVERNMENT|PRIVATE|UNKNOWN)$")
    ownership: Optional[str] = Field(None, max_length=50)
    ownership_category: Optional[str] = Field(None, max_length=50)
    
    region_id: Optional[int] = None
    council_id: Optional[int] = None
    ward_id: Optional[int] = None
    village_street_id: Optional[int] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    school_address: Optional[str] = None
    location_details: Optional[str] = None
    
    accomodation: Optional[str] = Field(None, max_length=50)
    
    is_primary: Optional[bool] = None
    is_olevel: Optional[bool] = None
    is_alevel: Optional[bool] = None
    is_vocational: Optional[bool] = None
    is_technical: Optional[bool] = None
    is_special: Optional[bool] = None
    is_inclusive: Optional[bool] = None
    is_new_curriculum: Optional[bool] = None
    is_religious: Optional[bool] = None
    is_private_centre: Optional[bool] = None
    is_inactive: Optional[bool] = None
    
    is_olevel_boarding: Optional[bool] = None
    is_alevel_boarding: Optional[bool] = None
    is_olevel_girls: Optional[bool] = None
    is_alevel_girls: Optional[bool] = None
    is_olevel_boys: Optional[bool] = None
    is_alevel_boys: Optional[bool] = None
    is_unisex: Optional[bool] = None
    is_mixture: Optional[bool] = None
    
    school_category: Optional[str] = Field(None, max_length=50)


class SchoolCreate(SchoolBase):
    pass


class SchoolResponse(SchoolBase):
    slug: Optional[str] = None
    
    # Relationships
    region: Optional[RegionResponse] = None
    council: Optional[CouncilResponse] = None
    ward: Optional[WardResponse] = None
    
    class Config:
        from_attributes = True


# ==================== NECTA RESULTS SCHEMAS ====================

class NectaSchoolRankBase(BaseModel):
    centre_number: str
    exam_year: int
    exam_type: str
    registered: int
    sat: int
    passed: int
    school_gpa: Optional[float] = None
    school_average: Optional[float] = None
    ranking: Optional[Dict[str, Dict[str, int]]] = None


class NectaSchoolRankResponse(NectaSchoolRankBase):
    id: int
    school: Optional[SchoolResponse] = None
    
    class Config:
        from_attributes = True


class NectaResultAnalysisBase(BaseModel):
    centre_number: str
    exam_year: int
    exam_type: str
    analysis: Dict[str, Any]


class NectaResultAnalysisResponse(NectaResultAnalysisBase):
    id: int
    school: Optional[SchoolResponse] = None
    
    class Config:
        from_attributes = True


class NectaSubjectRankBase(BaseModel):
    school_analysis_id: int
    centre_number: str
    subject_code: str
    subject_name: str
    subject_gpa: Optional[float] = None
    passed: Optional[int] = None
    registered: Optional[int] = None
    exam_year: int
    exam_type: str


class NectaSubjectRankResponse(NectaSubjectRankBase):
    id: int
    
    class Config:
        from_attributes = True


# ==================== SELECTIONS SCHEMAS ====================

class SchoolFlowStatsBase(BaseModel):
    origin_centre_number: str
    destination_centre_number: str
    cycle_year: int
    student_count: int
    female_count: int
    male_count: int


class SchoolFlowStatsResponse(SchoolFlowStatsBase):
    id: int
    origin_school: Optional[SchoolResponse] = None
    destination_school: Optional[SchoolResponse] = None
    
    class Config:
        from_attributes = True


class SchoolCombStatsBase(BaseModel):
    origin_centre_number: str
    destination_centre_number: str
    comb_code: str
    cycle_year: int
    student_count: int
    female_count: int
    male_count: int


class SchoolCombStatsResponse(SchoolCombStatsBase):
    id: int
    origin_school: Optional[SchoolResponse] = None
    destination_school: Optional[SchoolResponse] = None
    
    class Config:
        from_attributes = True


class SchoolCourseStatsBase(BaseModel):
    origin_centre_number: str
    college_id: Optional[int] = None
    course_slug: str
    course_name: str
    cycle_year: int
    student_count: int
    female_count: int
    male_count: int


class SchoolCourseStatsResponse(SchoolCourseStatsBase):
    id: int
    origin_school: Optional[SchoolResponse] = None
    
    class Config:
        from_attributes = True


class CombStatsBase(BaseModel):
    comb_code: str
    cycle_year: int
    region_id: Optional[int] = None
    council_id: Optional[int] = None
    ward_id: Optional[int] = None
    total_placed: int
    female_count: int
    male_count: int
    schools_receiving: int
    schools_originating: int


class CombStatsResponse(CombStatsBase):
    id: int
    region: Optional[RegionResponse] = None
    council: Optional[CouncilResponse] = None
    ward: Optional[WardResponse] = None
    
    class Config:
        from_attributes = True


class SchoolSummaryStatsBase(BaseModel):
    centre_number: str
    cycle_year: int
    
    # Outgoing
    outgoing_total: int
    outgoing_female: int
    outgoing_male: int
    outgoing_alevel: int
    outgoing_college: int
    outgoing_day: int
    outgoing_boarding: int
    
    # Geographic scope (KATA/MKOA aggregation)
    outgoing_ward_scope: int       # KATA - same ward
    outgoing_council_scope: int    # same council
    outgoing_regional_scope: int   # MKOA - same region
    
    outgoing_destinations: int
    
    # Incoming
    incoming_total: int
    incoming_female: int
    incoming_male: int
    incoming_origins: int


class SchoolSummaryStatsResponse(SchoolSummaryStatsBase):
    id: int
    school: Optional[SchoolResponse] = None
    
    class Config:
        from_attributes = True


# ==================== PATHWAYS SCHEMAS ====================

class NectaSpecializationBase(BaseModel):
    name: str = Field(..., max_length=100)
    slug: str = Field(..., max_length=100)
    description: Optional[str] = None


class NectaSpecializationResponse(NectaSpecializationBase):
    id: int
    
    class Config:
        from_attributes = True


class NectaCombSubjectBase(BaseModel):
    comb_id: int
    subject_code: str = Field(..., max_length=10)
    subject_name: str = Field(..., max_length=100)
    subject_slug: str = Field(..., max_length=100)
    sort_order: int = 0


class NectaCombSubjectResponse(NectaCombSubjectBase):
    id: int
    
    class Config:
        from_attributes = True


class NectaCombBase(BaseModel):
    code: str = Field(..., max_length=10)
    name: str = Field(..., max_length=255)
    slug: str = Field(..., max_length=100)
    description: Optional[str] = None
    career_pathways: Optional[str] = None
    specialization_id: Optional[int] = None


class NectaCombResponse(NectaCombBase):
    id: int
    specialization: Optional[NectaSpecializationResponse] = None
    comb_subjects: Optional[List[NectaCombSubjectResponse]] = None
    
    class Config:
        from_attributes = True


class NectaTradeBase(BaseModel):
    name: str = Field(..., max_length=255)
    slug: str = Field(..., max_length=100)
    description: Optional[str] = None
    career_prospects: Optional[str] = None
    exam_type: str = Field(..., default="GATSCCE")
    specialization_id: Optional[int] = None


class NectaTradeResponse(NectaTradeBase):
    id: int
    specialization: Optional[NectaSpecializationResponse] = None
    
    class Config:
        from_attributes = True


class NectaCollegeBase(BaseModel):
    name: str = Field(..., max_length=255)
    slug: str = Field(..., max_length=100)
    short_name: Optional[str] = Field(None, max_length=50)
    description: Optional[str] = None
    college_type: str = Field(..., default="university")
    region_id: Optional[int] = None
    website: Optional[str] = Field(None, max_length=255)
    is_active: bool = True


class NectaCollegeResponse(NectaCollegeBase):
    id: int
    region: Optional[RegionResponse] = None
    
    class Config:
        from_attributes = True


class NectaCourseBase(BaseModel):
    college_id: int
    name: str = Field(..., max_length=255)
    slug: str = Field(..., max_length=100)
    description: Optional[str] = None
    duration_years: Optional[int] = None
    specialization_id: Optional[int] = None


class NectaCourseResponse(NectaCourseBase):
    id: int
    college: Optional[NectaCollegeResponse] = None
    
    class Config:
        from_attributes = True


# ==================== UTILITY SCHEMAS ====================

class PaginationMeta(BaseModel):
    page: int
    page_size: int
    total_items: int
    total_pages: int


class PaginatedResponse(BaseModel):
    """Generic paginated response wrapper."""
    data: List[Any]
    meta: PaginationMeta
    
    class Config:
        arbitrary_types_allowed = True
