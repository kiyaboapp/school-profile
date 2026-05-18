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
    RegionSummaryResponse,
    CouncilSummaryResponse,
    NationalSummaryResponse,
    PaginatedResponse,
    PaginationMeta,
)


# Main selections router
router = APIRouter(prefix="/shuleni", tags=["Shuleni Selections"])


@router.get("/selections/{year}/summary", response_model=NationalSummaryResponse)
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


@router.get("/region/{slug}/selections/{year}", response_model=RegionSummaryResponse)
def get_region_selections(
    slug: str,
    year: int,
    db: Session = Depends(get_db)
):
    """
    Get regional level selections summary.
    Powers /shuleni/region/{slug}/selections/{year} pages.
    """
    service = SelectionsService(db)
    stats = service.get_region_selections_summary(slug, year)
    
    if not stats:
        raise HTTPException(status_code=404, detail="Region selections not found")
    
    return stats


@router.get("/council/{slug}/selections/{year}", response_model=CouncilSummaryResponse)
def get_council_selections(
    slug: str,
    year: int,
    db: Session = Depends(get_db)
):
    """
    Get council level selections summary.
    Powers /shuleni/council/{slug}/selections/{year} pages.
    """
    service = SelectionsService(db)
    stats = service.get_council_selections_summary(slug, year)
    
    if not stats:
        raise HTTPException(status_code=404, detail="Council selections not found")
    
    return stats


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
    return service.get_school_flow_stats(year=year, exam_type=exam_type, limit=limit)


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


@comb_router.get("/{slug}/stats", response_model=List[CombStatsResponse])
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


@comb_router.get("/{slug}/region/{region_slug}/stats", response_model=List[CombStatsResponse])
def get_combination_regional_stats(
    slug: str,
    region_slug: str,
    year: Optional[int] = None,
    db: Session = Depends(get_db)
):
    """Get regional-level statistics for a combination."""
    comb_service = CombinationService(db)
    comb = comb_service.get_comb_by_slug(slug)
    
    if not comb:
        raise HTTPException(status_code=404, detail="Combination not found")
    
    # Get region ID from slug first
    region_data = comb_service.get_region_by_slug(region_slug)
    if not region_data:
        raise HTTPException(status_code=404, detail="Region not found")
    
    selections_service = SelectionsService(db)
    return selections_service.get_comb_stats_by_region(comb.code, region_data.id, year)


@comb_router.get("/{slug}/council/{council_slug}/stats", response_model=List[CombStatsResponse])
def get_combination_council_stats(
    slug: str,
    council_slug: str,
    year: Optional[int] = None,
    db: Session = Depends(get_db)
):
    """Get council-level statistics for a combination."""
    comb_service = CombinationService(db)
    comb = comb_service.get_comb_by_slug(slug)
    
    if not comb:
        raise HTTPException(status_code=404, detail="Combination not found")
    
    council_data = comb_service.get_council_by_slug(council_slug)
    if not council_data:
        raise HTTPException(status_code=404, detail="Council not found")
    
    selections_service = SelectionsService(db)
    return selections_service.get_comb_stats_by_council(comb.code, council_data.id, year)


@comb_router.get("/{slug}/schools-offering", response_model=List[SchoolCombStatsResponse])
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
        limit=limit,
        is_destination=True
    )


@comb_router.get("/{slug}/feeder-schools", response_model=List[SchoolCombStatsResponse])
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
        limit=limit,
        is_destination=False
    )
