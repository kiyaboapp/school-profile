"""
NECTA Models for FastAPI Application
File: app/db/models/necta/models.py

All models prefixed with 'Necta' except School which references existing model.
"""

from datetime import datetime, date
from typing import Optional, Dict, Any, List
from sqlalchemy import (
    String, Integer, Float, Date, DateTime, Boolean,
    ForeignKey, CheckConstraint, UniqueConstraint, Index, Text
)
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import JSONB
from app.db.base import Base  # Adjust import based on your project structure
from app.core.datetime_utils import utcnow


class NectaResults(Base):
    """Individual student NECTA results - stores raw exam data per candidate"""
    __tablename__ = "necta_results"
    
    # Primary key
    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    
    # Core fields
    cand_number: Mapped[str] = mapped_column(String(50), nullable=False)
    exam_year: Mapped[int] = mapped_column(Integer, nullable=False)
    prem_no: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    sex: Mapped[str] = mapped_column(String(1), nullable=False)  # M/F from SEX_CHOICES
    
    # Foreign key to existing School model using centre_number
    centre_number: Mapped[str] = mapped_column(
        String(10),
        ForeignKey("schools.centre_number", onupdate="CASCADE"),
        nullable=False
    )
    
    # JSON fields
    subjects: Mapped[Dict[str, Any]] = mapped_column(JSONB, default=dict, nullable=False)
    subjects_primary: Mapped[Dict[str, Any]] = mapped_column(JSONB, default=dict, nullable=False)
    
    # Result fields
    aggt: Mapped[Optional[str]] = mapped_column(String(10), nullable=True)
    division: Mapped[Optional[str]] = mapped_column(String(10), nullable=True)
    exam_type: Mapped[str] = mapped_column(String(10), nullable=False)  # STNA, SFNA, PSLE, FTNA, CSEE, ACSEE, GATSCCE, DSEE, GATCE
    
    # Relationships
    school: Mapped["School"] = relationship("School", back_populates="necta_results")
    
    __table_args__ = (
        Index('unique_necta_results', 'cand_number', 'exam_type', 'exam_year', unique=True),
        Index('idx_results_cand_year', 'cand_number', 'exam_year'),
        Index('ix_necta_results_cand_number', 'cand_number'),
        Index('ix_necta_results_exam_year', 'exam_year'),
        Index('ix_necta_results_centre_number', 'centre_number'),
    )
    
    def __repr__(self) -> str:
        return f"<NectaResults(cand_number={self.cand_number}, exam_type={self.exam_type}, exam_year={self.exam_year})>"


class NectaResultAnalysis(Base):
    """Aggregated analysis of school exam results - stores computed statistics and rankings"""
    __tablename__ = "necta_result_analysis"
    
    # Primary key
    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    
    # Foreign key to existing School model using centre_number
    centre_number: Mapped[str] = mapped_column(
        String(10),
        ForeignKey("schools.centre_number", onupdate="CASCADE"),
        nullable=False
    )
    
    # Core fields
    exam_year: Mapped[int] = mapped_column(Integer, nullable=False)
    analysis: Mapped[Dict[str, Any]] = mapped_column(JSONB, nullable=False)
    analysis_date: Mapped[date] = mapped_column(Date, nullable=False)
    exam_type: Mapped[str] = mapped_column(String(10), nullable=False)  # STNA, SFNA, PSLE, FTNA, CSEE, ACSEE, GATSCCE, DSEE, GATCE
    
    # Relationships
    school: Mapped["School"] = relationship("School", back_populates="necta_analyses")
    subject_ranks: Mapped[List["NectaSubjectRank"]] = relationship(
        "NectaSubjectRank",
        back_populates="school_analysis",
        cascade="all, delete-orphan"
    )
    school_rank: Mapped[Optional["NectaSchoolRank"]] = relationship(
        "NectaSchoolRank",
        back_populates="school_analysis",
        uselist=False,
        cascade="all, delete-orphan"
    )
    
    __table_args__ = (
        Index('unique_school_year_examtype', 'centre_number', 'exam_year', 'exam_type', unique=True),
        Index('idx_analysis_school_year', 'centre_number', 'exam_year'),
        Index('ix_necta_result_analysis_exam_year', 'exam_year'),
        Index('ix_necta_result_analysis_centre_number', 'centre_number'),
    )
    
    def __repr__(self) -> str:
        return f"<NectaResultAnalysis(centre_number={self.centre_number}, exam_type={self.exam_type}, exam_year={self.exam_year})>"


class NectaSubjectCode(Base):
    """NECTA subject code master table"""
    __tablename__ = "necta_subject_codes"
    
    # Primary key
    code: Mapped[str] = mapped_column(String(10), primary_key=True)
    
    # Timestamps
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow, nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow, onupdate=utcnow, nullable=False)
    
    # Relationships
    names: Mapped[List["NectaSubjectName"]] = relationship(
        "NectaSubjectName",
        back_populates="subject_code_rel",
        cascade="all, delete-orphan"
    )
    abbreviations: Mapped[List["NectaSubjectAbbreviation"]] = relationship(
        "NectaSubjectAbbreviation",
        back_populates="subject_code_rel",
        cascade="all, delete-orphan"
    )
    subject_ranks: Mapped[List["NectaSubjectRank"]] = relationship(
        "NectaSubjectRank",
        back_populates="code_rel",
        cascade="all, delete-orphan"
    )
    subject_schools: Mapped[List["NectaSubjectSchool"]] = relationship(
        "NectaSubjectSchool",
        primaryjoin="NectaSubjectCode.code == NectaSubjectSchool.subject_code",
        foreign_keys="[NectaSubjectSchool.subject_code]",
        lazy="noload",
        viewonly=True
    )
    
    def __repr__(self) -> str:
        return f"<NectaSubjectCode(code={self.code})>"


class NectaSubjectName(Base):
    """Subject names with historical tracking"""
    __tablename__ = "necta_subject_names"
    
    # Primary key
    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    
    # Foreign key
    code: Mapped[str] = mapped_column(
        String(10),
        ForeignKey("necta_subject_codes.code", ondelete="CASCADE"),
        nullable=False
    )
    
    # Fields
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    is_current: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    
    # Timestamps
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow, nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow, onupdate=utcnow, nullable=False)
    
    # Relationships
    subject_code_rel: Mapped["NectaSubjectCode"] = relationship("NectaSubjectCode", back_populates="names")
    
    __table_args__ = (
        UniqueConstraint('code', 'name', name='unique_necta_subject_name'),
        Index('idx_subj_code_current', 'code', 'is_current'),
    )
    
    def __repr__(self) -> str:
        return f"<NectaSubjectName(code={self.code}, name={self.name})>"


class NectaSubjectAbbreviation(Base):
    """Subject abbreviations with historical tracking"""
    __tablename__ = "necta_subject_abbreviations"
    
    # Primary key
    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    
    # Foreign key
    subject_code: Mapped[str] = mapped_column(
        String(10),
        ForeignKey("necta_subject_codes.code", ondelete="CASCADE"),
        nullable=False
    )
    
    # Fields
    abbreviation: Mapped[str] = mapped_column(String(50), nullable=False)
    is_current: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    
    # Timestamps
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow, nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow, onupdate=utcnow, nullable=False)
    
    # Relationships
    subject_code_rel: Mapped["NectaSubjectCode"] = relationship("NectaSubjectCode", back_populates="abbreviations")
    
    __table_args__ = (
        UniqueConstraint('subject_code', 'abbreviation', name='unique_necta_subject_abbreviation'),
        Index('idx_subj_abbr_current', 'subject_code', 'is_current'),
        Index('idx_abbreviation', 'abbreviation'),
    )
    
    def __repr__(self) -> str:
        return f"<NectaSubjectAbbreviation(code={self.subject_code}, abbr={self.abbreviation})>"


class NectaSubjectRank(Base):
    """
    Subject-level performance ranking for NECTA exams.
    
    Stores comprehensive ranking data for each subject at each school,
    including performance metrics, location-based rankings, and statistical data.
    """
    __tablename__ = "necta_subject_ranks"
    
    # Primary key
    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    
    # Foreign keys
    code: Mapped[str] = mapped_column(
        String(10),
        ForeignKey("necta_subject_codes.code", ondelete="CASCADE"),
        nullable=False
    )
    school_analysis_id: Mapped[int] = mapped_column(
        Integer,
        ForeignKey("necta_result_analysis.id", ondelete="CASCADE"),
        nullable=False
    )
    centre_number: Mapped[str] = mapped_column(
        String(10),
        ForeignKey("schools.centre_number", onupdate="CASCADE"),
        nullable=False
    )
    
    # Performance metrics
    subject_gpa: Mapped[Optional[float]] = mapped_column(Float, nullable=True, index=True)
    subject_avg: Mapped[Optional[float]] = mapped_column(Float, nullable=True, index=True)
    
    # Ranking data
    ranking: Mapped[Optional[Dict[str, Any]]] = mapped_column(JSONB, nullable=True)
    
    # Subject-specific analysis
    subject_analysis: Mapped[Optional[Dict[str, Any]]] = mapped_column(JSONB, nullable=True)
    
    # Student statistics
    registered: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    sat: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    no_ca: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    withheld: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    clean: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    passed: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    
    # Location FKs (names resolved via relationships to regions/councils/wards tables)
    region_id: Mapped[Optional[int]] = mapped_column(
        Integer, ForeignKey("regions.region_id", onupdate="CASCADE"), nullable=True, index=True
    )
    council_id: Mapped[Optional[int]] = mapped_column(
        Integer, ForeignKey("councils.council_id", onupdate="CASCADE"), nullable=True, index=True
    )
    ward_id: Mapped[Optional[int]] = mapped_column(
        Integer, ForeignKey("wards.ward_id", onupdate="CASCADE"), nullable=True
    )
    ownership: Mapped[Optional[str]] = mapped_column(String(50), nullable=True, index=True)

    # Relationships
    code_rel: Mapped["NectaSubjectCode"] = relationship("NectaSubjectCode", back_populates="subject_ranks")
    school_analysis: Mapped["NectaResultAnalysis"] = relationship("NectaResultAnalysis", back_populates="subject_ranks")
    school: Mapped["School"] = relationship("School", back_populates="necta_subject_ranks")
    region: Mapped[Optional["Region"]] = relationship("Region", foreign_keys=[region_id])
    council: Mapped[Optional["Council"]] = relationship("Council", foreign_keys=[council_id])
    ward: Mapped[Optional["Ward"]] = relationship("Ward", foreign_keys=[ward_id])

    __table_args__ = (
        UniqueConstraint('school_analysis_id', 'code', name='unique_necta_subject_rank'),
        CheckConstraint('sat <= registered OR sat IS NULL', name='check_sat_lte_registered'),
        CheckConstraint('passed <= sat OR passed IS NULL', name='check_passed_lte_sat'),
        Index('idx_sr_region_gpa', 'region_id', 'subject_gpa'),
        Index('idx_sr_council_gpa', 'council_id', 'subject_gpa'),
        Index('idx_sr_ownership_gpa', 'ownership', 'subject_gpa'),
    )
    
    @property
    def exam_type(self) -> Optional[str]:
        """Get exam type from related analysis"""
        return self.school_analysis.exam_type if self.school_analysis else None
    
    @property
    def exam_year(self) -> Optional[int]:
        """Get exam year from related analysis"""
        return self.school_analysis.exam_year if self.school_analysis else None
    
    @property
    def subject_name(self) -> Optional[str]:
        """Get subject name from related code"""
        if self.code_rel and self.code_rel.names:
            # Return the first name (usually the most recent/current one due to relationship ordering or just first)
            # Ideally should filter by is_current=True, but list access is simpler here
            for name in self.code_rel.names:
                if name.is_current:
                    return name.name
            return self.code_rel.names[0].name
        return None

    @property
    def absent(self) -> Optional[int]:
        """Calculate number of absent students"""
        if self.registered is not None and self.sat is not None:
            return self.registered - self.sat
        return None
    
    @property
    def failed(self) -> Optional[int]:
        """Calculate number of failed students"""
        if all(v is not None for v in [self.registered, self.passed, self.withheld]):
            return self.registered - self.passed - self.withheld
        return None
    
    @property
    def pass_rate(self) -> Optional[float]:
        """Calculate pass rate percentage"""
        if self.sat and self.sat > 0 and self.passed is not None:
            return round((self.passed / self.sat) * 100, 2)
        return None
    
    @property
    def attendance_rate(self) -> Optional[float]:
        """Calculate attendance rate percentage"""
        if self.registered and self.registered > 0 and self.sat is not None:
            return round((self.sat / self.registered) * 100, 2)
        return None
    
    def get_national_rank(self) -> Optional[Dict[str, Any]]:
        """Get national ranking position"""
        if self.ranking:
            return {
                'position': self.ranking.get('pos'),
                'out_of': self.ranking.get('out_of')
            }
        return None
    
    def get_ownership_rank(self, location_level: Optional[str] = None) -> Optional[Dict[str, Any]]:
        """Get ownership-based ranking, optionally at specific location level"""
        if not self.ranking:
            return None
        
        if location_level:
            location_data = self.ranking.get('location', {}).get(location_level, {})
            return location_data.get('ownership')
        
        return self.ranking.get('ownership')
    
    def get_location_rank(self, level: str = 'region') -> Optional[Dict[str, Any]]:
        """Get ranking at specific location level"""
        if not self.ranking or 'location' not in self.ranking:
            return None
        return self.ranking['location'].get(level)
    
    def get_all_rankings(self) -> Optional[Dict[str, Any]]:
        """Get formatted dictionary of all rankings"""
        if not self.ranking:
            return None
        
        return {
            'national': self.get_national_rank(),
            'ownership': self.get_ownership_rank(),
            'region': self.get_location_rank('region'),
            'council': self.get_location_rank('council'),
            'ward': self.get_location_rank('ward'),
            'region_ownership': self.get_ownership_rank('region'),
            'council_ownership': self.get_ownership_rank('council'),
            'ward_ownership': self.get_ownership_rank('ward'),
        }
    
    def __repr__(self) -> str:
        return f"<NectaSubjectRank(code={self.code}, centre_number={self.centre_number}, exam_year={self.exam_year})>"


class NectaSchoolRank(Base):
    """
    School-level overall performance ranking for NECTA exams.
    
    Stores comprehensive ranking data for each school's overall performance,
    including performance metrics, location-based rankings, and statistical data.
    """
    __tablename__ = "necta_school_ranks"
    
    # Primary key
    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    
    # Foreign keys
    school_analysis_id: Mapped[int] = mapped_column(
        Integer,
        ForeignKey("necta_result_analysis.id", ondelete="CASCADE"),
        unique=True,
        nullable=False
    )
    centre_number: Mapped[str] = mapped_column(
        String(10),
        ForeignKey("schools.centre_number", onupdate="CASCADE"),
        nullable=False
    )
    
    # Performance metrics
    school_average: Mapped[Optional[float]] = mapped_column(Float, nullable=True, index=True)
    school_gpa: Mapped[Optional[float]] = mapped_column(Float, nullable=True, index=True)
    
    # Ranking data
    ranking: Mapped[Optional[Dict[str, Any]]] = mapped_column(JSONB, nullable=True)
    
    # Grade/Division distribution
    grades: Mapped[Optional[Dict[str, Any]]] = mapped_column(JSONB, nullable=True)
    divisions: Mapped[Optional[Dict[str, Any]]] = mapped_column(JSONB, nullable=True)
    
    # Student statistics
    registered: Mapped[Optional[int]] = mapped_column(Integer, nullable=True, index=True)
    sat: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    absent: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    passed: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    withheld: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    no_ca: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    
    # Size category
    over_under_40: Mapped[Optional[str]] = mapped_column(String(10), nullable=True, index=True)
    
    # Location FKs (names resolved via relationships to regions/councils/wards tables)
    region_id: Mapped[Optional[int]] = mapped_column(
        Integer, ForeignKey("regions.region_id", onupdate="CASCADE"), nullable=True, index=True
    )
    council_id: Mapped[Optional[int]] = mapped_column(
        Integer, ForeignKey("councils.council_id", onupdate="CASCADE"), nullable=True, index=True
    )
    ward_id: Mapped[Optional[int]] = mapped_column(
        Integer, ForeignKey("wards.ward_id", onupdate="CASCADE"), nullable=True
    )
    ownership: Mapped[Optional[str]] = mapped_column(String(50), nullable=True, index=True)

    # Error tracking
    error_data: Mapped[Optional[Dict[str, Any]]] = mapped_column(JSONB, nullable=True)

    # Relationships
    school_analysis: Mapped["NectaResultAnalysis"] = relationship("NectaResultAnalysis", back_populates="school_rank")
    school: Mapped["School"] = relationship("School", back_populates="necta_school_ranks")
    region: Mapped[Optional["Region"]] = relationship("Region", foreign_keys=[region_id])
    council: Mapped[Optional["Council"]] = relationship("Council", foreign_keys=[council_id])
    ward: Mapped[Optional["Ward"]] = relationship("Ward", foreign_keys=[ward_id])

    __table_args__ = (
        Index('idx_schr_region_avg', 'region_id', 'school_average'),
        Index('idx_schr_region_gpa', 'region_id', 'school_gpa'),
        Index('idx_schr_ownership_avg', 'ownership', 'school_average'),
        Index('idx_schr_ownership_gpa', 'ownership', 'school_gpa'),
        Index('idx_schr_size_avg', 'over_under_40', 'school_average'),
        Index('idx_schr_size_gpa', 'over_under_40', 'school_gpa'),
    )
    
    @property
    def exam_type(self) -> Optional[str]:
        """Get exam type from related analysis"""
        return self.school_analysis.exam_type if self.school_analysis else None
    
    @property
    def exam_year(self) -> Optional[int]:
        """Get exam year from related analysis"""
        return self.school_analysis.exam_year if self.school_analysis else None
    
    @property
    def pass_rate(self) -> Optional[float]:
        """Calculate pass rate percentage"""
        if self.sat and self.sat > 0 and self.passed is not None:
            return round((self.passed / self.sat) * 100, 2)
        return None
    
    @property
    def attendance_rate(self) -> Optional[float]:
        """Calculate attendance rate percentage"""
        if self.registered and self.registered > 0 and self.sat is not None:
            return round((self.sat / self.registered) * 100, 2)
        return None
    
    @property
    def failure_count(self) -> Optional[int]:
        """Calculate number of failed students"""
        if all(v is not None for v in [self.sat, self.passed]):
            return self.sat - self.passed
        return None
    
    def get_national_rank(self) -> Optional[Dict[str, Any]]:
        """Get national ranking position"""
        if self.ranking:
            return {
                'position': self.ranking.get('pos'),
                'out_of': self.ranking.get('out_of')
            }
        return None
    
    def get_ownership_rank(self, location_level: Optional[str] = None) -> Optional[Dict[str, Any]]:
        """Get ownership-based ranking, optionally at specific location level"""
        if not self.ranking:
            return None
        
        if location_level:
            location_data = self.ranking.get('location', {}).get(location_level, {})
            return location_data.get('ownership')
        
        return self.ranking.get('ownership')
    
    def get_size_rank(self, location_level: Optional[str] = None) -> Optional[Dict[str, Any]]:
        """Get size-based ranking (over_under_40), optionally at specific location level"""
        if not self.ranking:
            return None
        
        if location_level:
            location_data = self.ranking.get('location', {}).get(location_level, {})
            return location_data.get('over_under_40')
        
        return self.ranking.get('over_under_40')
    
    def get_location_rank(self, level: str = 'region') -> Optional[Dict[str, Any]]:
        """Get ranking at specific location level"""
        if not self.ranking or 'location' not in self.ranking:
            return None
        return self.ranking['location'].get(level)
    
    def get_all_rankings(self) -> Optional[Dict[str, Any]]:
        """Get formatted dictionary of all rankings"""
        if not self.ranking:
            return None
        
        return {
            'national': self.get_national_rank(),
            'ownership': self.get_ownership_rank(),
            'over_under_40': self.get_size_rank(),
            'region': self.get_location_rank('region'),
            'region_ownership': self.get_ownership_rank('region'),
            'region_over_under_40': self.get_size_rank('region'),
            'council': self.get_location_rank('council'),
            'council_ownership': self.get_ownership_rank('council'),
            'council_over_under_40': self.get_size_rank('council'),
            'ward': self.get_location_rank('ward'),
            'ward_ownership': self.get_ownership_rank('ward'),
            'ward_over_under_40': self.get_size_rank('ward'),
        }
    
    def __repr__(self) -> str:
        perf = self.school_average or self.school_gpa
        return f"<NectaSchoolRank(centre_number={self.centre_number}, exam_year={self.exam_year}, perf={perf})>"


class NectaResultUrl(Base):
    """NECTA result URLs - stores official result page URLs for each exam"""
    __tablename__ = "necta_result_urls"
    
    # Primary key
    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    
    # Fields
    url: Mapped[str] = mapped_column(String(500), nullable=False)
    mirror_url: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    exam_type: Mapped[str] = mapped_column(String(10), nullable=False)  # STNA, SFNA, PSLE, FTNA, CSEE, ACSEE, GATSCCE, DSEE, GATCE
    exam_year: Mapped[int] = mapped_column(Integer, nullable=False)
    
    __table_args__ = (
        UniqueConstraint('exam_type', 'exam_year', name='unique_necta_result_url'),
        Index('idx_result_url_type_year', 'exam_type', 'exam_year'),
    )
    
    def __repr__(self) -> str:
        return f"<NectaResultUrl(exam_type={self.exam_type}, exam_year={self.exam_year})>"


class NectaUrlTemplate(Base):
    """URL templates for auto-generating NECTA result URLs by centre number"""
    __tablename__ = "necta_url_templates"
    
    # Primary key
    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    
    # Fields
    exam_type: Mapped[str] = mapped_column(String(10), nullable=False)  # STNA, SFNA, PSLE, FTNA, CSEE, ACSEE, GATSCCE, DSEE, GATCE
    exam_year: Mapped[int] = mapped_column(Integer, nullable=False)
    url_template: Mapped[str] = mapped_column(String(500), nullable=False)
    centre_placeholder: Mapped[str] = mapped_column(String(20), nullable=False)
    domain: Mapped[str] = mapped_column(String(20), default='necta', nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    
    # Timestamps
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow, nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow, onupdate=utcnow, nullable=False)
    
    __table_args__ = (
        UniqueConstraint('exam_type', 'exam_year', name='unique_necta_url_template'),
    )
    
    def generate_url(self, centre_number: str) -> str:
        """
        Generate URL for a specific centre number by replacing the placeholder.
        Preserves the case pattern of the placeholder.
        """
        # Check if placeholder is uppercase or mixed case
        if self.centre_placeholder.isupper():
            replacement = centre_number.upper()
        elif self.centre_placeholder.islower():
            replacement = centre_number.lower()
        else:
            # Mixed case - preserve the first character's case
            if self.centre_placeholder[0].isupper():
                replacement = centre_number.upper()
            else:
                replacement = centre_number.lower()
        
        return self.url_template.replace(self.centre_placeholder, replacement)
    
    def __repr__(self) -> str:
        return f"<NectaUrlTemplate(exam_type={self.exam_type}, exam_year={self.exam_year}, domain={self.domain})>"
