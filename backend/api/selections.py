"""
FastAPI routes for selections data - Shuleni Platform
All routes prefixed with /api/v1/shuleni
"""
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional

from ..core.database import get_db
from ..services.selections import SelectionsService, CombinationService
from ..schemas import (
    SchoolSummaryStatsResponse,
    CombStatsResponse,
    SchoolCombStatsResponse,
    SchoolFlowStatsResponse,
    NectaCombResponse,
)


# Main selections router
router = APIRouter(prefix="/shuleni", tags=["Shuleni Selections"])


@router.get("/selections/{year}/summary")
def get_national_selections_summary(
    year: int,
    db: Session = Depends(get_db)
):
    """
    Get national selections summary for a year.
    Powers /shuleni/selections/{year} pages.
    """
    service = SelectionsService(db)
    return service.get_national_selections_summary(year)


@router.get("/school/{slug}/selections/{year}", response_model=SchoolSummaryStatsResponse)
def get_school_selections(
    slug: str,
    year: int,
    db: Session = Depends(get_db)
):
    """
    Get selections summary for a specific school and year.
    Powers /shuleni/school/{slug}/selections/{year} pages.
    
    Returns:
    - Geographic scope breakdown (outgoing_ward_scope, outgoing_regional_scope)
    - Boarding/day split
    - Incoming/outgoing totals
    - Combination breakdowns
    - Flow statistics
    """
    service = SelectionsService(db)
    stats = service.get_school_summary_stats_by_slug(slug, year)
    
    if not stats:
        raise HTTPException(status_code=404, detail="School selections not found")
    
    return stats


@router.get("/school/{slug}/selections/{year}/rankings")
def get_school_rankings(
    slug: str,
    year: int,
    db: Session = Depends(get_db)
):
    """
    Get school rankings in region and council.
    Returns rank, total schools, and percentile.
    """
    from ..models import School
    
    school = db.query(School).filter(School.slug == slug).first()
    if not school:
        raise HTTPException(status_code=404, detail="School not found")
    
    service = SelectionsService(db)
    
    region_rank = None
    council_rank = None
    
    if school.region_id:
        region_rank = service.get_school_rank_in_region(school.centre_number, year, school.region_id)
    
    if school.council_id:
        council_rank = service.get_school_rank_in_council(school.centre_number, year, school.council_id)
    
    return {
        "school_name": school.school_name,
        "slug": slug,
        "year": year,
        "region_rank": region_rank,
        "council_rank": council_rank
    }


@router.get("/region/{region_id}/top-schools/{year}")
def get_top_schools_in_region(
    region_id: int,
    year: int,
    school_type: Optional[str] = Query(None, description="GOVERNMENT or PRIVATE"),
    limit: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db)
):
    """Get top schools in a region by outgoing students."""
    service = SelectionsService(db)
    return service.get_top_schools_by_location(
        year=year,
        location_type='region',
        location_id=region_id,
        limit=limit,
        school_type=school_type
    )


@router.get("/council/{council_id}/top-schools/{year}")
def get_top_schools_in_council(
    council_id: int,
    year: int,
    school_type: Optional[str] = Query(None, description="GOVERNMENT or PRIVATE"),
    limit: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db)
):
    """Get top schools in a council by outgoing students."""
    service = SelectionsService(db)
    return service.get_top_schools_by_location(
        year=year,
        location_type='council',
        location_id=council_id,
        limit=limit,
        school_type=school_type
    )


@router.get("/special-placements/{year}")
def get_special_schools_placements(
    year: int,
    location_type: Optional[str] = Query(None, description="region or council"),
    location_id: Optional[int] = Query(None),
    db: Session = Depends(get_db)
):
    """Get placements to special schools."""
    service = SelectionsService(db)
    return service.get_special_schools_placements(
        year=year,
        location_type=location_type,
        location_id=location_id
    )


@router.get("/top-combinations/{year}", response_model=List[CombStatsResponse])
def get_top_combinations(
    year: int,
    limit: int = Query(20, ge=1, le=50),
    db: Session = Depends(get_db)
):
    """Get top combinations nationally by total placed students."""
    service = SelectionsService(db)
    return service.get_top_combinations_national(year, limit)


@router.get("/top-incoming-schools/{year}", response_model=List[SchoolSummaryStatsResponse])
def get_top_incoming_schools(
    year: int,
    limit: int = Query(20, ge=1, le=50),
    db: Session = Depends(get_db)
):
    """Get schools with most incoming A-Level students."""
    service = SelectionsService(db)
    return service.get_top_incoming_schools(year, limit)


@router.get("/top-outgoing-schools/{year}", response_model=List[SchoolSummaryStatsResponse])
def get_top_outgoing_schools(
    year: int,
    limit: int = Query(20, ge=1, le=50),
    db: Session = Depends(get_db)
):
    """Get schools with most outgoing O-Level students."""
    service = SelectionsService(db)
    return service.get_top_outgoing_schools(year, limit)


@router.get("/flows/{year}", response_model=List[SchoolFlowStatsResponse])
def get_school_flows(
    year: int,
    exam_type: str = Query("alevel", description="alevel or olevel"),
    limit: int = Query(100, ge=1, le=500),
    db: Session = Depends(get_db)
):
    """
    Get school-to-school flow data.
    Powers /shuleni/flows/{year} pages.
    Shows origin → destination with student counts.
    """
    service = SelectionsService(db)
    return service.get_school_flow_stats(year=year, limit=limit)


# Combinations router
comb_router = APIRouter(prefix="/shuleni/comb", tags=["Combinations"])


@comb_router.get("/{slug}", response_model=NectaCombResponse)
def get_combination_detail(
    slug: str,
    db: Session = Depends(get_db)
):
    """
    Get combination details with subjects.
    Powers /shuleni/comb/{slug} pages.
    """
    service = CombinationService(db)
    comb = service.get_comb_by_slug(slug)
    
    if not comb:
        raise HTTPException(status_code=404, detail="Combination not found")
    
    return comb


@comb_router.get("/{slug}/stats")
def get_combination_national_stats(
    slug: str,
    year: Optional[int] = None,
    db: Session = Depends(get_db)
):
    """Get national-level statistics for a combination."""
    comb_service = CombinationService(db)
    comb = comb_service.get_comb_by_slug(slug)
    
    if not comb:
        raise HTTPException(status_code=404, detail="Combination not found")
    
    selections_service = SelectionsService(db)
    return selections_service.get_comb_stats_national(comb.code, year)


@comb_router.get("/{slug}/schools-offering")
def get_schools_offering_combination(
    slug: str,
    year: Optional[int] = None,
    limit: int = Query(100, ge=1, le=500),
    db: Session = Depends(get_db)
):
    """Get A-Level schools offering this combination (destination schools)."""
    comb_service = CombinationService(db)
    comb = comb_service.get_comb_by_slug(slug)
    
    if not comb:
        raise HTTPException(status_code=404, detail="Combination not found")
    
    selections_service = SelectionsService(db)
    return selections_service.get_school_comb_stats(
        comb_code=comb.code,
        year=year,
        limit=limit
    )


@comb_router.get("/{slug}/feeder-schools")
def get_feeder_schools_for_combination(
    slug: str,
    year: Optional[int] = None,
    limit: int = Query(100, ge=1, le=500),
    db: Session = Depends(get_db)
):
    """Get O-Level feeder schools for this combination (origin schools)."""
    comb_service = CombinationService(db)
    comb = comb_service.get_comb_by_slug(slug)
    
    if not comb:
        raise HTTPException(status_code=404, detail="Combination not found")
    
    selections_service = SelectionsService(db)
    return selections_service.get_school_comb_stats(
        comb_code=comb.code,
        year=year,
        limit=limit
    )
