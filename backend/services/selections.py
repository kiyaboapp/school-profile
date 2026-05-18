"""
Services for ShuleYetu API
Business logic layer between routes and database
"""
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import func, desc, asc, case, cast, Integer
from typing import List, Optional, Tuple, Dict, Any
from datetime import datetime


class SelectionsService:
    """Service for selections data operations."""
    
    def __init__(self, db: Session):
        self.db = db
    
    def get_school_summary_stats(
        self,
        centre_number: str,
        year: int
    ) -> Optional[SchoolSummaryStatsResponse]:
        """Get summary stats for a specific school and year."""
        from ..models import SchoolSummaryStats
        
        stats = (
            self.db.query(SchoolSummaryStats)
            .filter(
                SchoolSummaryStats.centre_number == centre_number,
                SchoolSummaryStats.cycle_year == year
            )
            .first()
        )
        
        if not stats:
            return None
        
        return SchoolSummaryStatsResponse.model_validate(stats)
    
    def get_school_summary_stats_by_slug(
        self,
        slug: str,
        year: int
    ) -> Optional[SchoolSummaryStatsResponse]:
        """Get summary stats for a school by its slug."""
        from ..models import SchoolSummaryStats, School
        
        stats = (
            self.db.query(SchoolSummaryStats)
            .join(School, SchoolSummaryStats.centre_number == School.centre_number)
            .filter(
                School.slug == slug,
                SchoolSummaryStats.cycle_year == year
            )
            .first()
        )
        
        if not stats:
            return None
        
        return SchoolSummaryStatsResponse.model_validate(stats)
    
    def get_school_rank_in_region(
        self,
        centre_number: str,
        year: int,
        region_id: int
    ) -> Dict[str, Any]:
        """Calculate school's rank in region based on outgoing students."""
        from ..models import SchoolSummaryStats, School
        
        # Get the school's stats
        school_stats = (
            self.db.query(SchoolSummaryStats)
            .join(School, SchoolSummaryStats.centre_number == School.centre_number)
            .filter(
                SchoolSummaryStats.centre_number == centre_number,
                SchoolSummaryStats.cycle_year == year,
                School.region_id == region_id
            )
            .first()
        )
        
        if not school_stats:
            return {"rank": None, "total_schools": 0}
        
        # Count schools with higher outgoing totals
        schools_higher = (
            self.db.query(func.count(SchoolSummaryStats.id))
            .join(School, SchoolSummaryStats.centre_number == School.centre_number)
            .filter(
                SchoolSummaryStats.cycle_year == year,
                School.region_id == region_id,
                SchoolSummaryStats.outgoing_total > school_stats.outgoing_total
            )
            .scalar() or 0
        )
        
        # Total schools in region
        total_schools = (
            self.db.query(func.count(SchoolSummaryStats.id))
            .join(School, SchoolSummaryStats.centre_number == School.centre_number)
            .filter(
                SchoolSummaryStats.cycle_year == year,
                School.region_id == region_id
            )
            .scalar() or 0
        )
        
        rank = schools_higher + 1
        
        return {
            "rank": rank,
            "total_schools": total_schools,
            "percentile": round((1 - rank / total_schools) * 100, 1) if total_schools > 0 else 0
        }
    
    def get_school_rank_in_council(
        self,
        centre_number: str,
        year: int,
        council_id: int
    ) -> Dict[str, Any]:
        """Calculate school's rank in council based on outgoing students."""
        from ..models import SchoolSummaryStats, School
        
        school_stats = (
            self.db.query(SchoolSummaryStats)
            .join(School, SchoolSummaryStats.centre_number == School.centre_number)
            .filter(
                SchoolSummaryStats.centre_number == centre_number,
                SchoolSummaryStats.cycle_year == year,
                School.council_id == council_id
            )
            .first()
        )
        
        if not school_stats:
            return {"rank": None, "total_schools": 0}
        
        schools_higher = (
            self.db.query(func.count(SchoolSummaryStats.id))
            .join(School, SchoolSummaryStats.centre_number == School.centre_number)
            .filter(
                SchoolSummaryStats.cycle_year == year,
                School.council_id == council_id,
                SchoolSummaryStats.outgoing_total > school_stats.outgoing_total
            )
            .scalar() or 0
        )
        
        total_schools = (
            self.db.query(func.count(SchoolSummaryStats.id))
            .join(School, SchoolSummaryStats.centre_number == School.centre_number)
            .filter(
                SchoolSummaryStats.cycle_year == year,
                School.council_id == council_id
            )
            .scalar() or 0
        )
        
        rank = schools_higher + 1
        
        return {
            "rank": rank,
            "total_schools": total_schools,
            "percentile": round((1 - rank / total_schools) * 100, 1) if total_schools > 0 else 0
        }
    
    def get_top_schools_by_location(
        self,
        year: int,
        location_type: str,  # 'region', 'council', 'ward'
        location_id: int,
        limit: int = 20,
        school_type: Optional[str] = None  # 'GOVERNMENT', 'PRIVATE'
    ) -> List[Dict[str, Any]]:
        """Get top schools by outgoing students for a location."""
        from ..models import SchoolSummaryStats, School
        
        query = (
            self.db.query(
                SchoolSummaryStats,
                School.school_name,
                School.slug,
                School.school_type
            )
            .join(School, SchoolSummaryStats.centre_number == School.centre_number)
            .filter(
                SchoolSummaryStats.cycle_year == year,
                SchoolSummaryStats.outgoing_total > 0
            )
        )
        
        if location_type == 'region':
            query = query.filter(School.region_id == location_id)
        elif location_type == 'council':
            query = query.filter(School.council_id == location_id)
        elif location_type == 'ward':
            query = query.filter(School.ward_id == location_id)
        
        if school_type:
            query = query.filter(School.school_type == school_type)
        
        results = (
            query.order_by(desc(SchoolSummaryStats.outgoing_total))
            .limit(limit)
            .all()
        )
        
        return [
            {
                "school_name": r.school_name,
                "slug": r.slug,
                "school_type": r.school_type,
                "outgoing_total": r.outgoing_total,
                "outgoing_female": r.outgoing_female,
                "outgoing_male": r.outgoing_male,
                "outgoing_alevel": r.outgoing_alevel,
                "outgoing_college": r.outgoing_college,
            }
            for r in results
        ]
    
    def get_special_schools_placements(
        self,
        year: int,
        location_type: Optional[str] = None,
        location_id: Optional[int] = None
    ) -> List[Dict[str, Any]]:
        """Get placements to special schools (national schools, etc)."""
        from ..models import SchoolFlowStats, School as SchoolModel
        
        # Create alias for destination school
        SchoolDest = SchoolModel.__table__.alias('destination_school')
        
        query = (
            self.db.query(
                SchoolFlowStats,
                SchoolModel.school_name.label('origin_name'),
            )
            .join(SchoolModel, SchoolFlowStats.origin_centre_number == SchoolModel.centre_number)
            .filter(SchoolFlowStats.cycle_year == year)
        )
        
        # We'll need to enrich with destination data separately
        results = query.order_by(desc(SchoolFlowStats.student_count)).limit(50).all()
        
        return [
            {
                "origin_school": r.origin_name,
                "destination_centre": r.destination_centre_number if hasattr(r, 'destination_centre_number') else None,
                "student_count": r.student_count,
                "female_count": r.female_count,
                "male_count": r.male_count,
            }
            for r in results
        ]
    
    def get_comb_stats_national(
        self,
        comb_code: str,
        year: Optional[int] = None
    ) -> List[CombStatsResponse]:
        """Get national-level combination stats (all location fields NULL)."""
        from ..models import CombStats
        
        query = (
            self.db.query(CombStats)
            .filter(
                CombStats.comb_code == comb_code,
                CombStats.region_id.is_(None),
                CombStats.council_id.is_(None),
                CombStats.ward_id.is_(None)
            )
        )
        
        if year:
            query = query.filter(CombStats.cycle_year == year)
        
        stats = query.order_by(desc(CombStats.cycle_year)).all()
        
        return [CombStatsResponse.model_validate(s) for s in stats]
    
    def get_comb_stats_by_region(
        self,
        comb_code: str,
        region_id: int,
        year: Optional[int] = None
    ) -> List[CombStatsResponse]:
        """Get combination stats for a specific region."""
        from ..models import CombStats
        
        query = (
            self.db.query(CombStats)
            .filter(
                CombStats.comb_code == comb_code,
                CombStats.region_id == region_id,
                CombStats.council_id.is_(None),
                CombStats.ward_id.is_(None)
            )
        )
        
        if year:
            query = query.filter(CombStats.cycle_year == year)
        
        stats = query.order_by(desc(CombStats.cycle_year)).all()
        
        return [CombStatsResponse.model_validate(s) for s in stats]
    
    def get_comb_stats_by_council(
        self,
        comb_code: str,
        council_id: int,
        year: Optional[int] = None
    ) -> List[CombStatsResponse]:
        """Get combination stats for a specific council."""
        from ..models import CombStats
        
        query = (
            self.db.query(CombStats)
            .filter(
                CombStats.comb_code == comb_code,
                CombStats.council_id == council_id,
                CombStats.ward_id.is_(None)
            )
        )
        
        if year:
            query = query.filter(CombStats.cycle_year == year)
        
        stats = query.order_by(desc(CombStats.cycle_year)).all()
        
        return [CombStatsResponse.model_validate(s) for s in stats]
    
    def get_school_comb_stats(
        self,
        origin_centre_number: Optional[str] = None,
        destination_centre_number: Optional[str] = None,
        comb_code: Optional[str] = None,
        year: Optional[int] = None,
        limit: int = 50,
        is_destination: bool = False
    ) -> List[SchoolCombStatsResponse]:
        """Get combination allocation stats with filters."""
        from ..models import SchoolCombStats
        
        query = self.db.query(SchoolCombStats)
        
        if origin_centre_number:
            query = query.filter(SchoolCombStats.origin_centre_number == origin_centre_number)
        if destination_centre_number:
            query = query.filter(SchoolCombStats.destination_centre_number == destination_centre_number)
        if comb_code:
            query = query.filter(SchoolCombStats.comb_code == comb_code)
        if year:
            query = query.filter(SchoolCombStats.cycle_year == year)
        
        stats = query.order_by(desc(SchoolCombStats.student_count)).limit(limit).all()
        
        return [SchoolCombStatsResponse.model_validate(s) for s in stats]
    
    def get_school_flow_stats(
        self,
        origin_centre_number: Optional[str] = None,
        destination_centre_number: Optional[str] = None,
        year: Optional[int] = None,
        limit: int = 50
    ) -> List[SchoolFlowStatsResponse]:
        """Get school-to-school flow stats."""
        from ..models import SchoolFlowStats
        
        query = self.db.query(SchoolFlowStats)
        
        if origin_centre_number:
            query = query.filter(SchoolFlowStats.origin_centre_number == origin_centre_number)
        if destination_centre_number:
            query = query.filter(SchoolFlowStats.destination_centre_number == destination_centre_number)
        if year:
            query = query.filter(SchoolFlowStats.cycle_year == year)
        
        stats = query.order_by(desc(SchoolFlowStats.student_count)).limit(limit).all()
        
        return [SchoolFlowStatsResponse.model_validate(s) for s in stats]
    
    def get_national_selections_summary(
        self,
        year: int
    ) -> Dict[str, Any]:
        """Get national selections summary for a year."""
        from ..models import SchoolSummaryStats
        
        result = (
            self.db.query(
                func.sum(SchoolSummaryStats.outgoing_total).label('total_outgoing'),
                func.sum(SchoolSummaryStats.outgoing_alevel).label('total_alevel'),
                func.sum(SchoolSummaryStats.outgoing_college).label('total_college'),
                func.sum(SchoolSummaryStats.outgoing_boarding).label('total_boarding'),
                func.sum(SchoolSummaryStats.outgoing_day).label('total_day'),
            )
            .filter(SchoolSummaryStats.cycle_year == year)
            .first()
        )
        
        if not result:
            return {}
        
        return {
            'cycle_year': year,
            'total_outgoing': result.total_outgoing or 0,
            'total_alevel': result.total_alevel or 0,
            'total_college': result.total_college or 0,
            'total_boarding': result.total_boarding or 0,
            'total_day': result.total_day or 0,
        }
    
    def get_top_combinations_national(
        self,
        year: int,
        limit: int = 10
    ) -> List[CombStatsResponse]:
        """Get top combinations nationally by total placed."""
        from ..models import CombStats
        
        stats = (
            self.db.query(CombStats)
            .filter(
                CombStats.cycle_year == year,
                CombStats.region_id.is_(None),
                CombStats.council_id.is_(None),
                CombStats.ward_id.is_(None)
            )
            .order_by(desc(CombStats.total_placed))
            .limit(limit)
            .all()
        )
        
        return [CombStatsResponse.model_validate(s) for s in stats]
    
    def get_top_incoming_schools(
        self,
        year: int,
        limit: int = 10
    ) -> List[SchoolSummaryStatsResponse]:
        """Get schools with most incoming A-Level students."""
        from ..models import SchoolSummaryStats
        
        stats = (
            self.db.query(SchoolSummaryStats)
            .filter(
                SchoolSummaryStats.cycle_year == year,
                SchoolSummaryStats.incoming_total > 0
            )
            .order_by(desc(SchoolSummaryStats.incoming_total))
            .limit(limit)
            .all()
        )
        
        return [SchoolSummaryStatsResponse.model_validate(s) for s in stats]
    
    def get_top_outgoing_schools(
        self,
        year: int,
        limit: int = 10
    ) -> List[SchoolSummaryStatsResponse]:
        """Get schools with most outgoing O-Level students."""
        from ..models import SchoolSummaryStats
        
        stats = (
            self.db.query(SchoolSummaryStats)
            .filter(
                SchoolSummaryStats.cycle_year == year,
                SchoolSummaryStats.outgoing_total > 0
            )
            .order_by(desc(SchoolSummaryStats.outgoing_total))
            .limit(limit)
            .all()
        )
        
        return [SchoolSummaryStatsResponse.model_validate(s) for s in stats]


class CombinationService:
    """Service for combination (mchanganyiko) operations."""
    
    def __init__(self, db: Session):
        self.db = db
    
    def get_comb_by_slug(self, slug: str) -> Optional[NectaCombResponse]:
        """Get combination by slug with subjects."""
        from ..models import NectaComb
        
        comb = (
            self.db.query(NectaComb)
            .filter(NectaComb.slug == slug)
            .first()
        )
        
        if not comb:
            return None
        
        return NectaCombResponse.model_validate(comb)
    
    def get_all_combinations(self) -> List[NectaCombResponse]:
        """Get all combinations."""
        from ..models import NectaComb
        
        combs = self.db.query(NectaComb).all()
        
        return [NectaCombResponse.model_validate(c) for c in combs]
    
    def get_comb_by_code(self, code: str) -> Optional[NectaCombResponse]:
        """Get combination by code."""
        from ..models import NectaComb
        
        comb = (
            self.db.query(NectaComb)
            .filter(NectaComb.code == code)
            .first()
        )
        
        if not comb:
            return None
        
        return NectaCombResponse.model_validate(comb)
