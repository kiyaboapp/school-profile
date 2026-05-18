"""
TAMISEMI Selections Models
File: app/db/models/necta/selections.py

Models for government student allocations (outgoing + incoming).
Using 'comb' terminology as per mandates.

RAW DATA SOURCES:
  PSLE:  sex, count, origin_school, dest_school
  CSEE:  sex, count, comb_or_course, college_name, dest_school, origin_school

TWO SEPARATE STUDENT FLOWS IN CSEE:

  Flow 1 — O-Level → A-Level school (combination placement)
    dest_school = a school centre_number in the schools table
    Stored in SchoolCombStats  (destination_centre_number FK→schools)
    Also in SchoolFlowStats    (destination_centre_number FK→schools)
    outgoing_day / outgoing_boarding applies to these students

  Flow 2 — O-Level → College / VTC (course placement)
    dest = a college name resolved to NectaCollege in necta_colleges
    Stored in SchoolCourseStats (college_id FK→necta_colleges)
    NOT in SchoolFlowStats (school_flow_stats only tracks school-to-school flows)
    outgoing_college counts these; outgoing_day/outgoing_boarding excludes them

CombStats stores aggregates at four levels (NULL = national):
  region_id NULL,  council_id NULL,  ward_id NULL  → national
  region_id SET,   council_id NULL,  ward_id NULL  → regional
  region_id SET,   council_id SET,   ward_id NULL  → council
  region_id SET,   council_id SET,   ward_id SET   → ward
"""

from datetime import datetime
from typing import Optional

from sqlalchemy import (
    BigInteger, Integer, String, ForeignKey, UniqueConstraint, Index,
    DateTime, func
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


class SchoolFlowStats(TimestampMixin, Base):
    """
    Aggregate student count flowing from one school to another in a cycle year.
    Built from BOTH PSLE and CSEE rows grouped by (origin, destination, year).

    This is the source of truth for: "how many students moved from school A to
    school B in cycle year Y?" — including sex breakdown.
    To answer council-to-council or region-to-region flows, JOIN origin and
    destination through the schools table live — no separate flow table needed.
    """
    __tablename__ = "school_flow_stats"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    origin_centre_number: Mapped[str] = mapped_column(
        String(20), ForeignKey("schools.centre_number", ondelete="CASCADE"), nullable=False
    )
    destination_centre_number: Mapped[str] = mapped_column(
        String(20), ForeignKey("schools.centre_number", ondelete="CASCADE"), nullable=False
    )
    cycle_year: Mapped[int] = mapped_column(Integer, nullable=False)
    student_count: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    female_count: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    male_count: Mapped[int] = mapped_column(Integer, nullable=False, default=0)

    origin_school: Mapped["School"] = relationship(
        "School", foreign_keys=[origin_centre_number], back_populates="outgoing_flows"
    )
    destination_school: Mapped["School"] = relationship(
        "School", foreign_keys=[destination_centre_number], back_populates="incoming_flows"
    )

    __table_args__ = (
        UniqueConstraint(
            "origin_centre_number", "destination_centre_number", "cycle_year",
            name="uq_school_flow_origin_dest_year",
        ),
        Index("ix_sfs_origin_year", "origin_centre_number", "cycle_year"),
        Index("ix_sfs_dest_year", "destination_centre_number", "cycle_year"),
    )


class SchoolCombStats(TimestampMixin, Base):
    """
    Which A-Level combination students from an origin school were allocated,
    and which destination school they went to.

    Built from CSEE raw rows: (sex, count, comb_code, dest_school, origin_school).
    Because the raw data includes destination per row, we store it directly.
    This lets us answer "what combinations did students arriving at school X receive?"
    with exact numbers, not approximations.
    """
    __tablename__ = "school_comb_stats"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    origin_centre_number: Mapped[str] = mapped_column(
        String(20), ForeignKey("schools.centre_number", ondelete="CASCADE"), nullable=False
    )
    destination_centre_number: Mapped[str] = mapped_column(
        String(20), ForeignKey("schools.centre_number", ondelete="CASCADE"), nullable=False
    )
    comb_code: Mapped[str] = mapped_column(String(10), nullable=False)
    cycle_year: Mapped[int] = mapped_column(Integer, nullable=False)
    student_count: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    female_count: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    male_count: Mapped[int] = mapped_column(Integer, nullable=False, default=0)

    origin_school: Mapped["School"] = relationship(
        "School", foreign_keys=[origin_centre_number], back_populates="comb_allocation_stats"
    )
    destination_school: Mapped["School"] = relationship(
        "School", foreign_keys=[destination_centre_number], back_populates="incoming_comb_stats"
    )

    __table_args__ = (
        UniqueConstraint(
            "origin_centre_number", "destination_centre_number", "comb_code", "cycle_year",
            name="uq_school_comb_stats",
        ),
        Index("ix_scs_origin_year", "origin_centre_number", "cycle_year"),
        Index("ix_scs_dest_year", "destination_centre_number", "cycle_year"),
        Index("ix_scs_comb_year", "comb_code", "cycle_year"),
        # Composite for the incoming comb breakdown query — the hot path
        Index("ix_scs_dest_comb_year", "destination_centre_number", "comb_code", "cycle_year"),
    )


class SchoolCourseStats(TimestampMixin, Base):
    """
    Which post-secondary courses / trades students from an origin school were
    allocated, and which college/destination they went to.

    Built from CSEE raw rows: (sex, count, course_slug, college_name, dest_school,
    origin_school).

    IMPORTANT: College destinations are in necta_colleges, NOT in the schools table.
    college_id is a FK to necta_colleges.id, resolved from college_name at ingestion
    time. Nullable because not all college names in the raw data may resolve to a
    known NectaCollege entry.

    This is entirely separate from SchoolCombStats (A-Level school placements).
    College-bound students do NOT appear in school_flow_stats — that table only
    tracks school-to-school flows (PSLE primary→O-Level, O-Level→A-Level school).
    """
    __tablename__ = "school_course_stats"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    origin_centre_number: Mapped[str] = mapped_column(
        String(20), ForeignKey("schools.centre_number", ondelete="CASCADE"), nullable=False
    )
    college_id: Mapped[Optional[int]] = mapped_column(
        Integer, ForeignKey("necta_colleges.id", ondelete="SET NULL"), nullable=True
    )
    course_slug: Mapped[str] = mapped_column(String(100), nullable=False)
    course_name: Mapped[str] = mapped_column(String(255), nullable=False)
    cycle_year: Mapped[int] = mapped_column(Integer, nullable=False)
    student_count: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    female_count: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    male_count: Mapped[int] = mapped_column(Integer, nullable=False, default=0)

    origin_school: Mapped["School"] = relationship(
        "School", foreign_keys=[origin_centre_number], back_populates="course_allocation_stats"
    )
    destination_college: Mapped[Optional["NectaCollege"]] = relationship(
        "NectaCollege", foreign_keys=[college_id], back_populates="incoming_course_stats"
    )

    __table_args__ = (
        UniqueConstraint(
            "origin_centre_number", "college_id", "course_slug", "cycle_year",
            name="uq_school_course_stats",
        ),
        Index("ix_scrs_origin_year", "origin_centre_number", "cycle_year"),
        Index("ix_scrs_college_year", "college_id", "cycle_year"),
        Index("ix_scrs_course_year", "course_slug", "cycle_year"),
    )


class CombStats(TimestampMixin, Base):
    """
    Aggregate per A-Level combination per cycle year at four granularities.

    Row type determined by which location columns are NULL:
      region_id NULL,  council_id NULL,  ward_id NULL  → national
      region_id SET,   council_id NULL,  ward_id NULL  → regional
      region_id SET,   council_id SET,   ward_id NULL  → council-level
      region_id SET,   council_id SET,   ward_id SET   → ward-level

    When does each level need recomputing after a school location change?
      - National row: NEVER — same school, same students, just reclassified.
      - Region row: when school's region_id changes (old + new region rows).
      - Council row: when school's council_id changes (old + new council rows).
      - Ward row: when school's ward_id changes (old + new ward rows).
    See recompute_comb_stats.sql for the full recomputation scripts.
    """
    __tablename__ = "comb_stats"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    comb_code: Mapped[str] = mapped_column(String(10), nullable=False)
    cycle_year: Mapped[int] = mapped_column(Integer, nullable=False)

    # Location — all nullable; NULLs determine row granularity (see docstring above)
    region_id: Mapped[Optional[int]] = mapped_column(
        Integer, ForeignKey("regions.region_id", ondelete="SET NULL"), nullable=True
    )
    council_id: Mapped[Optional[int]] = mapped_column(
        Integer, ForeignKey("councils.council_id", ondelete="SET NULL"), nullable=True
    )
    ward_id: Mapped[Optional[int]] = mapped_column(
        Integer, ForeignKey("wards.ward_id", ondelete="SET NULL"), nullable=True
    )

    total_placed: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    female_count: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    male_count: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    schools_receiving: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    schools_originating: Mapped[int] = mapped_column(Integer, nullable=False, default=0)

    __table_args__ = (
        UniqueConstraint(
            "comb_code", "cycle_year", "region_id", "council_id", "ward_id",
            name="uq_comb_stats",
        ),
        Index("ix_cs_code_year", "comb_code", "cycle_year"),
        Index("ix_cs_region_code_year", "region_id", "comb_code", "cycle_year"),
        Index("ix_cs_council_code_year", "council_id", "comb_code", "cycle_year"),
        Index("ix_cs_ward_code_year", "ward_id", "comb_code", "cycle_year"),
    )


class SchoolSummaryStats(TimestampMixin, Base):
    """
    Per-school, per-cycle-year summary of selections.

    outgoing_day / outgoing_boarding: computed at ingestion using the destination
    school's accomodation flag as known at ingestion time. If a destination school's
    boarding status is later corrected, re-run recompute_summary_boarding.sql for
    that school's affected cycle years.

    All location queries JOIN through the schools table live, so correcting a
    school's region_id / council_id / ward_id automatically fixes all location-
    based queries without touching this table at all.
    """
    __tablename__ = "school_summary_stats"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    centre_number: Mapped[str] = mapped_column(
        String(20), ForeignKey("schools.centre_number", ondelete="CASCADE"), nullable=False
    )
    cycle_year: Mapped[int] = mapped_column(Integer, nullable=False)

    # Outgoing
    outgoing_total: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    outgoing_female: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    outgoing_male: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    # outgoing_alevel: students placed at A-Level schools (in school_comb_stats)
    # outgoing_college: students placed at colleges/VTCs (in school_course_stats)
    # outgoing_total = outgoing_alevel + outgoing_college
    outgoing_alevel: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    outgoing_college: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    # outgoing_day / outgoing_boarding: of the outgoing_alevel students only —
    # colleges have no boarding flag, so college-bound students are not counted here.
    outgoing_day: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    outgoing_boarding: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    outgoing_ward_scope: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    outgoing_council_scope: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    outgoing_regional_scope: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    outgoing_destinations: Mapped[int] = mapped_column(Integer, nullable=False, default=0)

    # Incoming
    incoming_total: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    incoming_female: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    incoming_male: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    incoming_origins: Mapped[int] = mapped_column(Integer, nullable=False, default=0)

    school: Mapped["School"] = relationship(
        "School", back_populates="selection_summaries"
    )

    __table_args__ = (
        UniqueConstraint("centre_number", "cycle_year", name="uq_school_summary_stats"),
        Index("ix_sss_centre_year", "centre_number", "cycle_year"),
    )