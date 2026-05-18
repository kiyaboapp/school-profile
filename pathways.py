"""
Academic Pathways Models
File: app/db/models/necta/pathways.py

National reference data for combinations (combs), trades, courses, and colleges.
Using 'comb' terminology as per mandates.
"""

from datetime import datetime
from typing import Optional, List

from sqlalchemy import (
    String, Integer, Boolean, ForeignKey, UniqueConstraint, Index, Text, DateTime, func
)
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base import Base
from app.core.datetime_utils import utcnow


class TimestampMixin:
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), default=utcnow, nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), default=utcnow, onupdate=utcnow, nullable=False
    )


class NectaSpecialization(TimestampMixin, Base):
    """
    Broad category grouping used to cluster combinations and trades.
    Examples: Science, Arts, Business, Vocational.
    """
    __tablename__ = "necta_specializations"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String(100), nullable=False, unique=True)
    slug: Mapped[str] = mapped_column(String(100), nullable=False, unique=True)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    combs: Mapped[List["NectaComb"]] = relationship(
        "NectaComb", back_populates="specialization", lazy="noload"
    )
    trades: Mapped[List["NectaTrade"]] = relationship(
        "NectaTrade", back_populates="specialization", lazy="noload"
    )


class NectaComb(TimestampMixin, Base):
    """
    Named A-Level subject combination (comb) offered in Tanzanian secondary schools.
    code is the canonical short identifier (e.g. PCM, HGL).
    """
    __tablename__ = "necta_combs"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    code: Mapped[str] = mapped_column(String(10), nullable=False, unique=True, index=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    slug: Mapped[str] = mapped_column(String(100), nullable=False, unique=True, index=True)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    career_pathways: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    specialization_id: Mapped[Optional[int]] = mapped_column(
        Integer, ForeignKey("necta_specializations.id", ondelete="SET NULL"), nullable=True
    )

    specialization: Mapped[Optional["NectaSpecialization"]] = relationship(
        "NectaSpecialization", back_populates="combs", lazy="joined"
    )
    comb_subjects: Mapped[List["NectaCombSubject"]] = relationship(
        "NectaCombSubject", back_populates="comb", lazy="selectin",
        cascade="all, delete-orphan",
    )
    comb_schools: Mapped[List["NectaCombSchool"]] = relationship(
        "NectaCombSchool", back_populates="comb", lazy="noload",
        cascade="all, delete-orphan",
    )


class NectaCombSubject(TimestampMixin, Base):
    """
    Links a comb to a subject code from necta_subject_codes.
    """
    __tablename__ = "necta_comb_subjects"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    comb_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("necta_combs.id", ondelete="CASCADE"), nullable=False
    )
    # Soft FK to necta_subject_codes.code
    subject_code: Mapped[str] = mapped_column(String(10), nullable=False)
    subject_name: Mapped[str] = mapped_column(String(100), nullable=False)
    subject_slug: Mapped[str] = mapped_column(String(100), nullable=False)
    sort_order: Mapped[int] = mapped_column(Integer, nullable=False, default=0)

    comb: Mapped["NectaComb"] = relationship(
        "NectaComb", back_populates="comb_subjects"
    )

    __table_args__ = (
        UniqueConstraint(
            "comb_id", "subject_code", name="uq_necta_comb_subject"
        ),
        Index("ix_ncs_comb_id", "comb_id"),
        Index("ix_ncs_subject_code", "subject_code"),
    )


class NectaCombSchool(TimestampMixin, Base):
    """
    Records that a school offers (or has offered) a specific combination (comb).
    """
    __tablename__ = "necta_comb_schools"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    comb_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("necta_combs.id", ondelete="CASCADE"), nullable=False
    )
    centre_number: Mapped[str] = mapped_column(
        String(20), ForeignKey("schools.centre_number", onupdate="CASCADE"), nullable=False
    )
    is_present: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)

    comb: Mapped["NectaComb"] = relationship(
        "NectaComb", back_populates="comb_schools"
    )
    school: Mapped["School"] = relationship(
        "School", back_populates="necta_comb_links"
    )

    __table_args__ = (
        UniqueConstraint(
            "comb_id", "centre_number", name="uq_necta_comb_school"
        ),
        Index("ix_ncsch_centre_number", "centre_number"),
        Index("ix_ncsch_comb_present", "comb_id", "is_present"),
    )


class NectaSubjectSchool(TimestampMixin, Base):
    """
    Records that a school offers (or has offered) a specific subject.
    """
    __tablename__ = "necta_subject_schools"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    subject_code: Mapped[str] = mapped_column(
        String(10), ForeignKey("necta_subject_codes.code", ondelete="CASCADE"), nullable=False
    )
    centre_number: Mapped[str] = mapped_column(
        String(20), ForeignKey("schools.centre_number", onupdate="CASCADE"), nullable=False
    )
    is_present: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)

    school: Mapped["School"] = relationship(
        "School", back_populates="necta_subject_links"
    )

    __table_args__ = (
        UniqueConstraint(
            "subject_code", "centre_number", name="uq_necta_subject_school"
        ),
        Index("ix_nssch_centre_number", "centre_number"),
        Index("ix_nssch_subject_code", "subject_code"),
    )


class NectaTrade(TimestampMixin, Base):
    """
    A vocational trade programme examined under GATSCCE or GATCE.
    """
    __tablename__ = "necta_trades"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False, unique=True)
    slug: Mapped[str] = mapped_column(String(100), nullable=False, unique=True, index=True)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    career_prospects: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    exam_type: Mapped[str] = mapped_column(
        String(20), nullable=False, default="GATSCCE"
    )

    specialization_id: Mapped[Optional[int]] = mapped_column(
        Integer, ForeignKey("necta_specializations.id", ondelete="SET NULL"), nullable=True
    )

    specialization: Mapped[Optional["NectaSpecialization"]] = relationship(
        "NectaSpecialization", back_populates="trades", lazy="joined"
    )
    trade_schools: Mapped[List["NectaTradeSchool"]] = relationship(
        "NectaTradeSchool", back_populates="trade", lazy="noload",
        cascade="all, delete-orphan",
    )


class NectaTradeSchool(TimestampMixin, Base):
    """
    Records that a school offers (or has offered) a specific vocational trade.
    """
    __tablename__ = "necta_trade_schools"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    trade_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("necta_trades.id", ondelete="CASCADE"), nullable=False
    )
    centre_number: Mapped[str] = mapped_column(
        String(20), ForeignKey("schools.centre_number", onupdate="CASCADE"), nullable=False
    )
    is_present: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)

    trade: Mapped["NectaTrade"] = relationship(
        "NectaTrade", back_populates="trade_schools"
    )
    school: Mapped["School"] = relationship(
        "School", back_populates="necta_trade_links"
    )

    __table_args__ = (
        UniqueConstraint("trade_id", "centre_number", name="uq_necta_trade_school"),
        Index("ix_nts_centre_number", "centre_number"),
        Index("ix_nts_trade_present", "trade_id", "is_present"),
    )


class NectaCollege(TimestampMixin, Base):
    """
    A post-secondary institution (university, college, vocational centre).
    """
    __tablename__ = "necta_colleges"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False, unique=True)
    slug: Mapped[str] = mapped_column(String(100), nullable=False, unique=True, index=True)
    short_name: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    college_type: Mapped[str] = mapped_column(
        String(50), nullable=False, default="university"
    )
    region_id: Mapped[Optional[int]] = mapped_column(
        Integer, ForeignKey("regions.region_id", ondelete="SET NULL"), nullable=True
    )
    website: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)

    courses: Mapped[List["NectaCourse"]] = relationship(
        "NectaCourse", back_populates="college", lazy="noload",
        cascade="all, delete-orphan",
    )
    incoming_course_stats: Mapped[List["SchoolCourseStats"]] = relationship(
        "SchoolCourseStats",
        foreign_keys="[SchoolCourseStats.college_id]",
        back_populates="destination_college",
        lazy="noload",
    )

    __table_args__ = (
        Index("ix_ncollege_region", "region_id"),
        Index("ix_ncollege_type", "college_type"),
    )


class NectaCourse(TimestampMixin, Base):
    """
    A named course or programme at a post-secondary institution.
    """
    __tablename__ = "necta_courses"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    college_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("necta_colleges.id", ondelete="CASCADE"), nullable=False
    )
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    slug: Mapped[str] = mapped_column(String(100), nullable=False, unique=True, index=True)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    duration_years: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)

    specialization_id: Mapped[Optional[int]] = mapped_column(
        Integer, ForeignKey("necta_specializations.id", ondelete="SET NULL"), nullable=True
    )

    college: Mapped["NectaCollege"] = relationship(
        "NectaCollege", back_populates="courses", lazy="joined"
    )

    __table_args__ = (
        UniqueConstraint("college_id", "slug", name="uq_necta_course_college_slug"),
        Index("ix_ncourse_college_id", "college_id"),
        Index("ix_ncourse_specialization", "specialization_id"),
    )