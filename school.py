from fastapi import HTTPException
from sqlalchemy import Column, String, Integer, Float, Text, Boolean, ForeignKey, CheckConstraint, Index, Date
from sqlalchemy.orm import relationship, validates
from app.db.base import Base


class School(Base):
    __tablename__ = "schools"
    
    # Primary key
    centre_number = Column(String(10), primary_key=True)
    
    # Basic information
    school_name = Column(String(100), nullable=False)
    school_type = Column(String(20), nullable=False)
    
    # Location hierarchy (FKs only — names live in regions/councils/wards tables)
    region_id = Column(Integer, ForeignKey("regions.region_id", onupdate="CASCADE"), nullable=True)
    council_id = Column(Integer, ForeignKey("councils.council_id", onupdate="CASCADE"), nullable=True)
    ward_id = Column(Integer, ForeignKey("wards.ward_id", onupdate="CASCADE"), nullable=True)
    
    # SEO-friendly slug for public URLs
    slug = Column(String(200), nullable=True, unique=True, index=True)
    
    # NectaSchool fields
    reg_number = Column(String(50), nullable=True)
    registration_date = Column(Date, nullable=True)
    ownership = Column(String(50), nullable=True)
    
    # Geographic coordinates
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    
    # Additional location and ownership details
    location_details = Column(Text, nullable=True)
    school_address = Column(Text, nullable=True)
    school_ownership = Column(String(100), nullable=True)
    ownership_category = Column(String(50), nullable=True)
    school_level = Column(String(100), nullable=True)
    accomodation = Column(String(50), nullable=True)
    school_website = Column(String(500), nullable=True)
    
    # Education level flags
    is_olevel = Column(Boolean, nullable=True)
    is_alevel = Column(Boolean, nullable=True)
    is_primary = Column(Boolean, nullable=True)
    is_pre = Column(Boolean, nullable=True)
    is_vocational = Column(Boolean, nullable=True)
    is_technical = Column(Boolean, nullable=True)
    is_special = Column(Boolean, nullable=True)
    is_new_curriculum = Column(Boolean, nullable=True)
    is_religious = Column(Boolean, nullable=True)
    
    # Gender-specific level flags
    is_olevel_boys = Column(Boolean, nullable=True)
    is_olevel_girls = Column(Boolean, nullable=True)
    is_alevel_boys = Column(Boolean, nullable=True)
    is_alevel_girls = Column(Boolean, nullable=True)
    is_primary_boys = Column(Boolean, nullable=True)
    is_primary_girls = Column(Boolean, nullable=True)
    
    # Gender composition flags
    is_unisex = Column(Boolean, nullable=True)
    is_mixture = Column(Boolean, nullable=True)
    
    # Boarding and status flags
    is_olevel_boarding = Column(Boolean, nullable=True)
    is_alevel_boarding = Column(Boolean, nullable=True)
    is_private_centre = Column(Boolean, nullable=True)
    is_inactive = Column(Boolean, nullable=True)

    # Category and inclusion
    school_category = Column(String(50), nullable=True)  # Normal, Inclusive, Special need, Unit
    is_inclusive = Column(Boolean, nullable=True)  # True = accepts disabled students with adapted environment

    # Village/street (lowest location level)
    village_street_id = Column(Integer, ForeignKey("village_streets.village_street_id", onupdate="CASCADE"), nullable=True)

    # Location relationships (read names via school.region.region_name etc.)
    region = relationship("Region", foreign_keys=[region_id])
    council = relationship("Council", foreign_keys=[council_id])
    ward = relationship("Ward", foreign_keys=[ward_id])
    village_street = relationship("VillageStreet", back_populates="schools")

    # Relationships
    users = relationship("User", back_populates="school")
    necta_results = relationship("NectaResults", back_populates="school")
    necta_analyses = relationship("NectaResultAnalysis", back_populates="school")
    necta_subject_ranks = relationship("NectaSubjectRank", back_populates="school")
    necta_school_ranks = relationship("NectaSchoolRank", back_populates="school")

    # NECTA Pathways & Selections relations
    necta_comb_links = relationship("NectaCombSchool", back_populates="school", cascade="all, delete-orphan")
    necta_subject_links = relationship("NectaSubjectSchool", back_populates="school", cascade="all, delete-orphan")
    necta_trade_links = relationship("NectaTradeSchool", back_populates="school", cascade="all, delete-orphan")
    selection_summaries = relationship("SchoolSummaryStats", back_populates="school", cascade="all, delete-orphan")

    # Flow stats — two FKs on SchoolFlowStats so foreign_keys must be explicit
    outgoing_flows = relationship(
        "SchoolFlowStats",
        foreign_keys="[SchoolFlowStats.origin_centre_number]",
        back_populates="origin_school",
        cascade="all, delete-orphan",
    )
    incoming_flows = relationship(
        "SchoolFlowStats",
        foreign_keys="[SchoolFlowStats.destination_centre_number]",
        back_populates="destination_school",
        cascade="all, delete-orphan",
    )

    # Comb allocation stats — two FKs so foreign_keys must be explicit
    comb_allocation_stats = relationship(
        "SchoolCombStats",
        foreign_keys="[SchoolCombStats.origin_centre_number]",
        back_populates="origin_school",
        cascade="all, delete-orphan",
    )
    incoming_comb_stats = relationship(
        "SchoolCombStats",
        foreign_keys="[SchoolCombStats.destination_centre_number]",
        back_populates="destination_school",
        cascade="all, delete-orphan",
    )

    # Course allocation stats — origin_centre_number is the only school FK now.
    # Destination is college_id → necta_colleges (not schools), so no foreign_keys
    # disambiguation is needed and no incoming_course_stats on School.
    # College-bound student stats are accessed via NectaCollege.incoming_course_stats.
    course_allocation_stats = relationship(
        "SchoolCourseStats",
        foreign_keys="[SchoolCourseStats.origin_centre_number]",
        back_populates="origin_school",
        cascade="all, delete-orphan",
    )

    __table_args__ = (
        CheckConstraint(
            "school_type IN ('GOVERNMENT', 'PRIVATE', 'UNKNOWN')", 
            name="valid_school_type"
        ),
        Index('ix_schools_reg_number', 'reg_number', unique=True, postgresql_where=(Column('reg_number').isnot(None))),
        # Performance: fix sequential scans on location joins
        Index('ix_schools_region_id', 'region_id'),
        Index('ix_schools_council_id', 'council_id'),
        Index('ix_schools_ward_id', 'ward_id'),
        Index('ix_schools_school_name', 'school_name'),
        Index('ix_schools_is_inactive', 'is_inactive'),
    )
    
    @validates('accomodation')
    def sync_boarding_flags(self, key, value):
        """
        Keep is_alevel_boarding and is_olevel_boarding in sync with accomodation.
        accomodation is the source of truth (raw value from TAMISEMI/NECTA data).
        The boolean flags are derived from it for query convenience.

        If accomodation is later corrected (e.g. school was 'Day' but should be
        'Boarding'), update accomodation and the flags will follow automatically.
        You must then re-run recompute_summary_boarding.sql for the affected
        school's cycle years to fix outgoing_day / outgoing_boarding counts.
        """
        if value is not None:
            v = value.upper()
            is_boarding = 'BOARDING' in v or 'BWENI' in v
            self.is_alevel_boarding = is_boarding
            self.is_olevel_boarding = is_boarding
        return value

    @validates('centre_number', 'reg_number')
    def normalize_lowercase(self, key, value):
        """Normalize centre_number and reg_number to lowercase"""
        if value is not None:
            return value.lower()
        return value
    
    @validates('school_name', 'ownership')
    def normalize_uppercase(self, key, value):
        """Normalize names and ownership to uppercase"""
        if value is not None:
            return value.upper()
        return value
    
    def generate_school_slug(self) -> str:
        """
        Generate SEO-friendly slug for the school.
        Format: {centre_number}-{name}-{level}-{ownership}-{region_name}-{council_name}

        Rules:
        - centre_number always first
        - level: "secondary" if olevel+alevel, "primary" if primary, "olevel"/"alevel" if only one — skip if none
        - ownership: "government"/"private" — skip if null/UNKNOWN
        - region_name: from FK relationship — skip if null
        - council_name: from FK — if already has DC/MC/CC/TC leave as-is, else append " DC" — skip if null
        - All lowercase, hyphen-separated, no special chars

        Returns:
            str: Generated slug
        """
        import re

        def _clean(value: str) -> str:
            value = value.lower()
            value = re.sub(r'[^a-z0-9\s-]', '', value)
            value = re.sub(r'\s+', '-', value.strip())
            return re.sub(r'-+', '-', value).strip('-')

        if not self.school_name:
            raise ValueError("School name is required to generate slug")

        parts = []

        # 1. Centre number
        if self.centre_number:
            parts.append(_clean(self.centre_number))

        # 2. School name
        parts.append(_clean(self.school_name))

        # 3. Education level
        if self.is_olevel and self.is_alevel:
            parts.append("secondary")
        elif self.is_primary:
            parts.append("primary")
        elif self.is_olevel:
            parts.append("olevel")
        elif self.is_alevel:
            parts.append("alevel")
        # else skip

        # 4. Ownership
        school_type = (self.school_type or '').upper()
        if school_type == 'GOVERNMENT':
            parts.append('government')
        elif school_type == 'PRIVATE':
            parts.append('private')
        # else skip (UNKNOWN/null)

        # 5. Region name
        _region_name = self.region.region_name if self.region else None
        if _region_name:
            parts.append(_clean(_region_name))

        # 6. Council name — already has DC/MC/CC/TC → leave as-is; otherwise append " DC"
        _council_name = self.council.council_name if self.council else None
        if _council_name:
            upper = _council_name.upper()
            has_suffix = any(f' {s}' in upper for s in ('DC', 'MC', 'CC', 'TC'))
            if not has_suffix:
                _council_name = _council_name + ' DC'
            parts.append(_clean(_council_name))

        slug = '-'.join(parts)
        return re.sub(r'-+', '-', slug).strip('-')