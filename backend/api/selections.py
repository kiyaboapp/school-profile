"""
FastAPI routes for selections data
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
    PaginatedResponse,
    PaginationMeta,
)


router = APIRouter(prefix="/selections", tags=["Selections"])


@router.get("/shule/{slug}/{year}", response_model=SchoolSummaryStatsResponse)
def get_school_selections(
    slug: str,
    year: int,
    db: Session = Depends(get_db)
):
    """
    Get selections summary for a specific school and year.
    
    This endpoint powers the /shule/{slug}/uchaguzi/{year} pages.
    Returns geographic scope breakdown (KATA/MKOA aggregation),
    boarding/day split, and incoming/outgoing totals.
    """
    service = SelectionsService(db)
    stats = service.get_school_summary_stats_by_slug(slug, year)
    
    if not stats:
        raise HTTPException(status_code=404, detail="School selections not found")
    
    return stats


@router.get("/uchaguzi/{year}/summary")
def get_national_selections_summary(
    year: int,
    db: Session = Depends(get_db)
):
    """
    Get national selections summary for a year.
    
    Powers /uchaguzi/{year} pages with aggregated statistics.
    """
    service = SelectionsService(db)
    return service.get_national_selections_summary(year)


@router.get("/uchaguzi/{year}/top-combinations", response_model=List[CombStatsResponse])
def get_top_combinations(
    year: int,
    limit: int = Query(10, ge=1, le=20),
    db: Session = Depends(get_db)
):
    """Get top combinations nationally by total placed."""
    service = SelectionsService(db)
    return service.get_top_combinations_national(year, limit)


@router.get("/uchaguzi/{year}/top-incoming-schools", response_model=List[SchoolSummaryStatsResponse])
def get_top_incoming_schools(
    year: int,
    limit: int = Query(10, ge=1, le=20),
    db: Session = Depends(get_db)
):
    """Get schools with most incoming A-Level students."""
    service = SelectionsService(db)
    return service.get_top_incoming_schools(year, limit)


@router.get("/uchaguzi/{year}/top-outgoing-schools", response_model=List[SchoolSummaryStatsResponse])
def get_top_outgoing_schools(
    year: int,
    limit: int = Query(10, ge=1, le=20),
    db: Session = Depends(get_db)
):
    """Get schools with most outgoing O-Level students."""
    service = SelectionsService(db)
    return service.get_top_outgoing_schools(year, limit)


@router.get("/mchanganyiko/{comb_slug}", response_model=NectaCombResponse)
def get_combination_detail(
    comb_slug: str,
    db: Session = Depends(get_db)
):
    """
    Get combination details with subjects.
    
    Powers /mchanganyiko/{comb_slug} pages.
    Note: Route uses 'mchanganyiko' but internally we use 'comb' terminology.
    """
    service = CombinationService(db)
    comb = service.get_comb_by_slug(comb_slug)
    
    if not comb:
        raise HTTPException(status_code=404, detail="Combination not found")
    
    return comb


@router.get("/mchanganyiko/{comb_slug}/stats", response_model=List[CombStatsResponse])
def get_combination_national_stats(
    comb_slug: str,
    year: Optional[int] = None,
    db: Session = Depends(get_db)
):
    """Get national-level statistics for a combination."""
    comb_service = CombinationService(db)
    comb = comb_service.get_comb_by_slug(comb_slug)
    
    if not comb:
        raise HTTPException(status_code=404, detail="Combination not found")
    
    selections_service = SelectionsService(db)
    return selections_service.get_comb_stats_national(comb.code, year)


@router.get("/mchanganyiko/{comb_slug}/mkoa/{region_id}/stats", response_model=List[CombStatsResponse])
def get_combination_regional_stats(
    comb_slug: str,
    region_id: int,
    year: Optional[int] = None,
    db: Session = Depends(get_db)
):
    """Get regional-level statistics for a combination."""
    comb_service = CombinationService(db)
    comb = comb_service.get_comb_by_slug(comb_slug)
    
    if not comb:
        raise HTTPException(status_code=404, detail="Combination not found")
    
    selections_service = SelectionsService(db)
    return selections_service.get_comb_stats_by_region(comb.code, region_id, year)


@router.get("/mchanganyiko/{comb_slug}/halmashauri/{council_id}/stats", response_model=List[CombStatsResponse])
def get_combination_council_stats(
    comb_slug: str,
    council_id: int,
    year: Optional[int] = None,
    db: Session = Depends(get_db)
):
    """Get council-level statistics for a combination."""
    comb_service = CombinationService(db)
    comb = comb_service.get_comb_by_slug(comb_slug)
    
    if not comb:
        raise HTTPException(status_code=404, detail="Combination not found")
    
    selections_service = SelectionsService(db)
    return selections_service.get_comb_stats_by_council(comb.code, council_id, year)


@router.get("/mchanganyiko/{comb_slug}/shule-zinazotoa", response_model=List[SchoolCombStatsResponse])
def get_schools_offering_combination(
    comb_slug: str,
    year: Optional[int] = None,
    limit: int = Query(50, ge=1, le=200),
    db: Session = Depends(get_db)
):
    """Get A-Level schools offering this combination (destination schools)."""
    comb_service = CombinationService(db)
    comb = comb_service.get_comb_by_slug(comb_slug)
    
    if not comb:
        raise HTTPException(status_code=404, detail="Combination not found")
    
    selections_service = SelectionsService(db)
    return selections_service.get_school_comb_stats(
        comb_code=comb.code,
        year=year,
        limit=limit
    )


@router.get("/mchanganyiko/{comb_slug}/shule-watoka", response_model=List[SchoolCombStatsResponse])
def get_feeder_schools_for_combination(
    comb_slug: str,
    year: Optional[int] = None,
    limit: int = Query(50, ge=1, le=200),
    db: Session = Depends(get_db)
):
    """Get O-Level feeder schools for this combination (origin schools)."""
    comb_service = CombinationService(db)
    comb = comb_service.get_comb_by_slug(comb_slug)
    
    if not comb:
        raise HTTPException(status_code=404, detail="Combination not found")
    
    selections_service = SelectionsService(db)
    return selections_service.get_school_comb_stats(
        comb_code=comb.code,
        year=year,
        limit=limit
    )


@router.get("/mtiririko/{year}", response_model=List[SchoolFlowStatsResponse])
def get_school_flows(
    year: int,
    limit: int = Query(50, ge=1, le=200),
    db: Session = Depends(get_db)
):
    """
    Get top school-to-school flows for a year.
    
    Powers /mtiririko/{exam_type}/{year} pages.
    Shows origin → destination with student counts.
    """
    service = SelectionsService(db)
    return service.get_school_flow_stats(year=year, limit=limit)


# ==================== COMB ROUTES (alias for mchanganyiko) ====================

comb_router = APIRouter(prefix="/comb", tags=["Combinations"])


@comb_router.get("/{slug}", response_model=NectaCombResponse)
def get_comb_detail(
    slug: str,
    db: Session = Depends(get_db)
):
    """Get combination by slug (alias for /mchanganyiko/{slug})."""
    service = CombinationService(db)
    comb = service.get_comb_by_slug(slug)
    
    if not comb:
        raise HTTPException(status_code=404, detail="Combination not found")
    
    return comb


@comb_router.get("/{slug}/stats", response_model=List[CombStatsResponse])
def get_comb_national_stats(
    slug: str,
    year: Optional[int] = None,
    db: Session = Depends(get_db)
):
    """Get national statistics for a combination."""
    service = CombinationService(db)
    comb = service.get_comb_by_slug(slug)
    
    if not comb:
        raise HTTPException(status_code=404, detail="Combination not found")
    
    selections_service = SelectionsService(db)
    return selections_service.get_comb_stats_national(comb.code, year)
