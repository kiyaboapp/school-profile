# ShuleYetu — Blueprint v6
## The Complete Product Architecture

**Language:** English throughout. Swahili appears only in URL slugs, in example field values where the source data is Swahili (school names, ward names), and in user-facing labels where Tanzania-specific terms have no clean English equivalent (bweni, kutwa, mchanganyiko).

**Year selector rule:** Every page that supports year selection renders a separate URL per year (e.g. `/shule/{slug}/uchaguzi/2024`). This is not a client-side dropdown that swaps data — it is a distinct page per year, so each year loads its own ad impressions, gets its own Google index entry, and generates its own traffic. This is a hard architectural decision that compounds revenue and SEO over time.

---

## PART 0 — THE DATA ARCHITECTURE

Before describing any page, every reader of this blueprint must understand the data model completely. The pages are products of the data. A reader who does not understand the data cannot evaluate whether a page design makes sense.

### 0.1 — Complete Model Reference

Every model currently in the codebase is documented here in full. This section is the single source of truth. When building any page, check here first before assuming what data is available.

---

#### `regions` table — `region.py`

```
region_id     Integer  PK autoincrement
region_name   String(50)  unique, not null
```
Relationships: `councils` (one-to-many). 31 rows total.

---

#### `councils` table — `council.py`

```
council_id    Integer  PK autoincrement
council_name  String(50)  not null
region_id     Integer  FK → regions.region_id  not null
```
Relationships: `region` (many-to-one), `wards` (one-to-many). ~185 rows total.

---

#### `wards` table — `ward.py`

```
ward_id       Integer  PK autoincrement
ward_name     String(100)  not null
council_id    Integer  FK → councils.council_id  not null
```
Relationships: `council` (many-to-one), `village_streets` (one-to-many). ~3,000 rows total.

---

#### `village_streets` table — `village_street.py`

```
village_street_id    Integer  PK autoincrement
village_street_name  String(200)  not null
ward_id              Integer  FK → wards.ward_id  not null
```
Relationships: `ward` (many-to-one), `schools` (one-to-many). Deepest geographic level.

---

#### `schools` table — `school.py`

PK: `centre_number` (String(10), normalized lowercase).

**Identity:**
```
centre_number      String(10)   PK, normalized lowercase
school_name        String(100)  not null, normalized uppercase
reg_number         String(50)   nullable, normalized lowercase, unique (partial index where not null)
registration_date  Date         nullable — source of "oldest schools" queries
slug               String(200)  nullable, unique, indexed — SEO URL key
school_level       String(100)  nullable — NECTA's own level label (raw string)
school_website     String(500)  nullable
```

**Type and ownership:**
```
school_type        String(20)   GOVERNMENT | PRIVATE | UNKNOWN — CheckConstraint enforced
ownership          String(50)   nullable, normalized uppercase
ownership_category String(50)   nullable
school_ownership   String(100)  nullable
```

**Location (FKs only — names come from joins):**
```
region_id          Integer  FK → regions.region_id       nullable, indexed
council_id         Integer  FK → councils.council_id     nullable, indexed
ward_id            Integer  FK → wards.ward_id           nullable, indexed
village_street_id  Integer  FK → village_streets         nullable
latitude           Float    nullable
longitude          Float    nullable
school_address     Text     nullable
location_details   Text     nullable
```

**Accommodation (source of truth → derived flags):**
```
accomodation       String(50)  nullable — raw value: BOARDING, DAY, BOARDING AND DAY, BWENI, KUTWA etc.
is_olevel_boarding Boolean     nullable — derived by @validates('accomodation') sync_boarding_flags()
is_alevel_boarding Boolean     nullable — derived by same validator
```
The validator fires on any write to `accomodation` and sets both boarding flags. `accomodation` is always the source of truth.

**Education level flags:**
```
is_primary    Boolean  nullable
is_olevel     Boolean  nullable
is_alevel     Boolean  nullable
is_vocational Boolean  nullable
is_technical  Boolean  nullable
is_pre        Boolean  nullable   — pre-primary
is_special    Boolean  nullable   — special needs school
```

**Gender per level:**
```
is_olevel_boys    Boolean  nullable
is_olevel_girls   Boolean  nullable
is_alevel_boys    Boolean  nullable
is_alevel_girls   Boolean  nullable
is_primary_boys   Boolean  nullable
is_primary_girls  Boolean  nullable
is_unisex         Boolean  nullable   — explicitly co-ed
is_mixture        Boolean  nullable   — mixed gender (distinct from unisex in source data)
```

**Special flags:**
```
is_inclusive      Boolean  nullable  — accepts students with disabilities, adapted environment
is_new_curriculum Boolean  nullable  — on the new Tanzania curriculum
is_religious      Boolean  nullable  — faith-based institution
is_private_centre Boolean  nullable  — exam-only centre: has candidates, no enrolled students
is_inactive       Boolean  nullable  — school no longer operational
```

**Category:**
```
school_category   String(50)  nullable  — Normal | Inclusive | Special need | Unit
```

**Slug generation — `generate_school_slug()`:**
Format: `{centre_number}-{school_name}-{level}-{ownership}-{region_name}-{council_name}`
Rules: centre_number always first; level = "secondary" if olevel+alevel, "primary" if primary only, "olevel"/"alevel" if only one; ownership = "government"/"private" (skip if UNKNOWN/null); region and council names appended; council gets " DC" suffix appended if it has no existing DC/MC/CC/TC suffix. All lowercase, hyphen-separated.

**Relationships (all defined):**
- `region`, `council`, `ward`, `village_street` — geographic joins
- `necta_comb_links` → `NectaCombSchool` (combinations this school offers)
- `necta_subject_links` → `NectaSubjectSchool` (subjects this school offers)
- `necta_trade_links` → `NectaTradeSchool` (trades this school offers)
- `selection_summaries` → `SchoolSummaryStats` (one per year)
- `outgoing_flows` → `SchoolFlowStats` (as origin)
- `incoming_flows` → `SchoolFlowStats` (as destination)
- `comb_allocation_stats` → `SchoolCombStats` (as origin)
- `incoming_comb_stats` → `SchoolCombStats` (as destination)
- `course_allocation_stats` → `SchoolCourseStats` (as origin; college is the destination, not another school)
- `necta_results`, `necta_analyses`, `necta_subject_ranks`, `necta_school_ranks` — results layer

---

#### `necta_exam_types` table — `necta_exam_type.py`

```
id                    Integer    PK autoincrement
exam_type_code        String(10) unique, indexed — e.g. CSEE, PSLE, ACSEE
exam_type_name        String(100) not null
exam_type_name_swahili String(100) nullable
description           String(500) nullable
education_level       String(50)  nullable
is_active             Boolean     default True
created_at, updated_at DateTime
```

Nine exam types:
- `PSLE` — Primary School Leaving Examination (Standard 7)
- `CSEE` — Certificate of Secondary Education Examination (Form 4 / O-Level)
- `ACSEE` — Advanced Certificate of Secondary Education Examination (Form 6 / A-Level)
- `FTNA` — Form Two National Assessment
- `SFNA` — Standard Four National Assessment
- `STNA` — Standard Two National Assessment
- `GATSCCE` — Government Technical and Secondary Certificate of Competence Examination (vocational O-Level)
- `GATCE` — Government Technical and Competence Examination (vocational A-Level)
- `DSEE` — Diploma of Secondary Education Examination (adult literacy O-Level)

Relationship: `user_access` → `UserNectaAccess` (access control).

---

#### `necta_result_analysis` table — `models.py`

One row per school × exam year × exam type. Contains the full NECTA analysis blob.

Key fields (from models.py — exact column names):
```
id                  PK
centre_number       FK → schools.centre_number
exam_year           Integer
exam_type           String (CSEE, ACSEE, PSLE, etc.)
analysis            JSONB  — full division breakdown, summary stats, raw analysis
```
Relationship: `school` (many-to-one), `necta_subject_ranks` (one-to-many).

The `analysis` JSONB contains: division counts (Div I, II, III, IV, 0), total registered, total sat, total passed. The exact structure of this JSONB is critical for any page rendering division breakdowns.

---

#### `necta_school_ranks` table — `models.py`

One row per school × exam year × exam type. The headline performance row.

```
id               PK
centre_number    FK → schools.centre_number
exam_year        Integer
exam_type        String
registered       Integer   — total registered for this exam
sat              Integer   — total who actually sat
passed           Integer   — total who passed
school_gpa       Float     nullable — school-level GPA (lower is better in TZ system)
school_average   Float     nullable — alternative average metric
ranking          JSONB     — positions: {national: {pos, out_of}, regional: {pos, out_of}, council: {pos, out_of}}
```
Relationship: `school` (many-to-one).

The `ranking` JSONB structure contains nested objects. When displaying positions, extract `ranking.national.pos`, `ranking.national.out_of`, `ranking.location.region.pos`, etc. Never display as "Ranked #X" — display as "among top X of Y schools."

---

#### `necta_subject_ranks` table — `models.py`

One row per school × subject × exam year × exam type.

```
id                  PK
school_analysis_id  FK → necta_result_analysis.id
centre_number       FK → schools.centre_number
subject_code        String   — e.g. "031" for Physics
subject_name        String
subject_gpa         Float    nullable
passed              Integer  nullable
registered          Integer  nullable
exam_year           Integer
exam_type           String
```
Relationship: `school` (many-to-one), `necta_result_analysis` (many-to-one).

---

#### `necta_specializations` table — `pathways.py`

```
id           Integer  PK autoincrement
name         String(100)  unique, not null
slug         String(100)  unique, not null
description  Text  nullable
created_at, updated_at  DateTime
```
Four rows: Science, Arts, Business, Vocational.
Relationships: `combs` (one-to-many → NectaComb), `trades` (one-to-many → NectaTrade).

---

#### `necta_combs` table — `pathways.py`

One row per A-Level combination.

```
id                Integer  PK autoincrement
code              String(10)   unique, indexed — PCM, HGE, CBG, ECA, PCB, HGL, EGM, PGM, CBA, BCZ, GAM, KLF, HKF, HKL, GCE, etc.
name              String(255)  not null — full name e.g. "Physics Chemistry Mathematics"
slug              String(100)  unique, indexed
description       Text  nullable
career_pathways   Text  nullable — what careers this leads to
specialization_id Integer  FK → necta_specializations.id  nullable (SET NULL on delete)
created_at, updated_at  DateTime
```
Relationships: `specialization` (many-to-one, lazy=joined), `comb_subjects` (one-to-many → NectaCombSubject, lazy=selectin), `comb_schools` (one-to-many → NectaCombSchool, lazy=noload).

All known combinations: PCM, PCB, HGE, CBG, ECA, HGL, EGM, PGM, CBA, BCZ, GAM, KLF, HKF, HKL, GCE. Every one needs its own page.

---

#### `necta_comb_subjects` table — `pathways.py`

Links a combination to its constituent subjects.

```
id            Integer  PK autoincrement
comb_id       Integer  FK → necta_combs.id  CASCADE
subject_code  String(10)  not null — soft FK to necta_subject_codes.code
subject_name  String(100) not null
subject_slug  String(100) not null
sort_order    Integer  not null, default 0
created_at, updated_at  DateTime
```
Unique constraint: (comb_id, subject_code).
Indexes: ix_ncs_comb_id, ix_ncs_subject_code.
Relationship: `comb` (many-to-one).

---

#### `necta_comb_schools` table — `pathways.py`

Records that a school currently offers (or has offered) a specific combination.

```
id              Integer  PK autoincrement
comb_id         Integer  FK → necta_combs.id  CASCADE
centre_number   String(20)  FK → schools.centre_number  CASCADE
is_present      Boolean  not null, default True
created_at, updated_at  DateTime
```
Unique constraint: (comb_id, centre_number).
Indexes: ix_ncsch_centre_number, ix_ncsch_comb_present (comb_id, is_present).
Relationships: `comb` (many-to-one), `school` (many-to-one).

Use `is_present = true` for current offer. `is_present = false` means the school previously offered this but no longer does — useful for "historically offered" context.

---

#### `necta_subject_schools` table — `pathways.py`

Records that a school offers a specific subject.

```
id              Integer  PK autoincrement
subject_code    String(10)  FK → necta_subject_codes.code  CASCADE
centre_number   String(20)  FK → schools.centre_number  CASCADE
is_present      Boolean  not null, default True
created_at, updated_at  DateTime
```
Unique constraint: (subject_code, centre_number).
Indexes: ix_nssch_centre_number, ix_nssch_subject_code.
Relationship: `school` (many-to-one).

---

#### `necta_trades` table — `pathways.py`

Vocational trade programmes.

```
id                Integer  PK autoincrement
name              String(255)  unique, not null
slug              String(100)  unique, indexed
description       Text  nullable
career_prospects  Text  nullable
exam_type         String(20)  not null, default "GATSCCE" — GATSCCE or GATCE
specialization_id Integer  FK → necta_specializations.id  nullable (SET NULL)
created_at, updated_at  DateTime
```
Relationships: `specialization` (many-to-one, lazy=joined), `trade_schools` (one-to-many → NectaTradeSchool, lazy=noload).

---

#### `necta_trade_schools` table — `pathways.py`

Records that a school offers a specific trade.

```
id              Integer  PK autoincrement
trade_id        Integer  FK → necta_trades.id  CASCADE
centre_number   String(20)  FK → schools.centre_number  CASCADE
is_present      Boolean  not null, default True
created_at, updated_at  DateTime
```
Unique constraint: (trade_id, centre_number).
Indexes: ix_nts_centre_number, ix_nts_trade_present (trade_id, is_present).
Relationships: `trade` (many-to-one), `school` (many-to-one).

---

#### `necta_colleges` table — `pathways.py`

Post-secondary institutions that appear as destinations in CSEE selections data. Separate from `schools` — colleges do not sit NECTA school exams and do not have centre_numbers in the school format.

```
id            Integer  PK autoincrement
name          String(255)  unique, not null
slug          String(100)  unique, indexed
short_name    String(50)   nullable
description   Text         nullable
college_type  String(50)   not null, default "university" — Teachers | Nursing | Health | Technical | Agriculture | Vocational | University | Other
region_id     Integer  FK → regions.region_id  nullable (SET NULL) — indexed
website       String(255)  nullable
is_active     Boolean  not null, default True
created_at, updated_at  DateTime
```
Indexes: ix_ncollege_region, ix_ncollege_type.
Relationships: `courses` (one-to-many → NectaCourse, cascade), `incoming_course_stats` (one-to-many → SchoolCourseStats).

Note: `college_type` default is "university" in the model but the selections data is for colleges (diplomas/certificates), not universities. The type should be set correctly during import. College profile pages are titled as colleges, not universities, per the product intent.

---

#### `necta_courses` table — `pathways.py`

A named course or programme at a specific college.

```
id                Integer  PK autoincrement
college_id        Integer  FK → necta_colleges.id  CASCADE
name              String(255)  not null
slug              String(100)  unique, indexed
description       Text  nullable
duration_years    Integer  nullable
specialization_id Integer  FK → necta_specializations.id  nullable (SET NULL)
created_at, updated_at  DateTime
```
Unique constraint: (college_id, slug).
Indexes: ix_ncourse_college_id, ix_ncourse_specialization.
Relationships: `college` (many-to-one, lazy=joined).

---

#### `school_flow_stats` table — `selections.py`

The school-to-school pipeline. One row per (origin, destination, cycle_year).

```
id                          BigInteger  PK autoincrement
origin_centre_number        String(20)  FK → schools.centre_number  CASCADE
destination_centre_number   String(20)  FK → schools.centre_number  CASCADE
cycle_year                  Integer     not null
student_count               Integer     not null, default 0
female_count                Integer     not null, default 0
male_count                  Integer     not null, default 0
created_at, updated_at  DateTime
```
Unique constraint: (origin_centre_number, destination_centre_number, cycle_year).
Indexes: ix_sfs_origin_year (origin, cycle_year), ix_sfs_dest_year (destination, cycle_year).
Relationships: `origin_school`, `destination_school` (both → School, foreign_keys explicit).

Covers BOTH exam types: PSLE flows (primary → O-Level) and CSEE flows (O-Level → A-Level school). College destinations do NOT appear here — only school-to-school flows.

---

#### `school_comb_stats` table — `selections.py`

Which combination each O-Level school's students received, and at which A-Level school.

```
id                          BigInteger  PK autoincrement
origin_centre_number        String(20)  FK → schools.centre_number  CASCADE
destination_centre_number   String(20)  FK → schools.centre_number  CASCADE
comb_code                   String(10)  not null — e.g. PCM, HGE
cycle_year                  Integer     not null
student_count               Integer     not null, default 0
female_count                Integer     not null, default 0
male_count                  Integer     not null, default 0
created_at, updated_at  DateTime
```
Unique constraint: (origin_centre_number, destination_centre_number, comb_code, cycle_year).
Indexes: ix_scs_origin_year, ix_scs_dest_year, ix_scs_comb_year, ix_scs_dest_comb_year (hot path: destination + comb + year).
Relationships: `origin_school`, `destination_school` (both → School, foreign_keys explicit).

More granular than school_flow_stats — breaks the same flow by combination. A pair (origin, destination) that appears in both tables will have multiple rows here (one per comb_code) but one row in school_flow_stats (total). The sum of student_count across all comb_codes for the same (origin, destination, year) = the student_count in school_flow_stats for that same pair.

---

#### `school_course_stats` table — `selections.py`

Which college and course each O-Level school's students were selected into.

```
id                  BigInteger  PK autoincrement
origin_centre_number String(20) FK → schools.centre_number  CASCADE
college_id          Integer     FK → necta_colleges.id  nullable (SET NULL)
course_slug         String(100) not null
course_name         String(255) not null
cycle_year          Integer     not null
student_count       Integer     not null, default 0
female_count        Integer     not null, default 0
male_count          Integer     not null, default 0
created_at, updated_at  DateTime
```
Unique constraint: (origin_centre_number, college_id, course_slug, cycle_year).
Indexes: ix_scrs_origin_year, ix_scrs_college_year, ix_scrs_course_year.
Relationships: `origin_school` (→ School), `destination_college` (→ NectaCollege).

College-bound students only. Completely separate from school_flow_stats and school_comb_stats. `college_id` is nullable because not all college names in raw data resolve to a known NectaCollege entry at import time.

---

#### `comb_stats` table — `selections.py`

Combination totals at four geographic granularities. Granularity determined by which location fields are NULL.

```
id                  BigInteger  PK autoincrement
comb_code           String(10)  not null
cycle_year          Integer     not null
region_id           Integer  FK → regions.region_id    nullable (SET NULL)
council_id          Integer  FK → councils.council_id  nullable (SET NULL)
ward_id             Integer  FK → wards.ward_id        nullable (SET NULL)
total_placed        Integer  not null, default 0
female_count        Integer  not null, default 0
male_count          Integer  not null, default 0
schools_receiving   Integer  not null, default 0  — distinct A-Level schools that received this comb
schools_originating Integer  not null, default 0  — distinct O-Level schools whose students got this comb
created_at, updated_at  DateTime
```
Unique constraint: (comb_code, cycle_year, region_id, council_id, ward_id).
Indexes: ix_cs_code_year, ix_cs_region_code_year, ix_cs_council_code_year, ix_cs_ward_code_year.

Granularity rules:
- `region_id NULL, council_id NULL, ward_id NULL` → national aggregate
- `region_id SET, council_id NULL, ward_id NULL` → regional aggregate
- `region_id SET, council_id SET, ward_id NULL` → council-level aggregate
- `region_id SET, council_id SET, ward_id SET` → ward-level aggregate

---

#### `school_summary_stats` table — `selections.py`

One row per school per cycle year. The headline summary of all selections activity.

```
id               BigInteger  PK autoincrement
centre_number    String(20)  FK → schools.centre_number  CASCADE
cycle_year       Integer     not null

-- OUTGOING (this school as origin — O-Level sending to A-Level/college, or Primary sending to O-Level)
outgoing_total          Integer  default 0  — all students who received any selection
outgoing_female         Integer  default 0
outgoing_male           Integer  default 0
outgoing_alevel         Integer  default 0  — students placed at A-Level schools (via school_comb_stats)
outgoing_college        Integer  default 0  — students placed at colleges (via school_course_stats)
-- Note: outgoing_total = outgoing_alevel + outgoing_college

outgoing_day            Integer  default 0  — of outgoing_alevel, those going to day schools
outgoing_boarding       Integer  default 0  — of outgoing_alevel, those going to boarding schools
-- Note: outgoing_day + outgoing_boarding = outgoing_alevel

outgoing_ward_scope     Integer  default 0  — of outgoing_alevel, those placed within same ward (KATA status)
outgoing_council_scope  Integer  default 0  — those placed within same council
outgoing_regional_scope Integer  default 0  — those placed within same region (MKOA status)
-- Derived (not stored): outside-region = outgoing_alevel - ward - council - regional
-- Note: ward + council + regional + outside-region = outgoing_alevel

outgoing_destinations   Integer  default 0  — distinct A-Level schools that received students from here

-- INCOMING (this school as destination — A-Level receiving from O-Level)
incoming_total    Integer  default 0
incoming_female   Integer  default 0
incoming_male     Integer  default 0
incoming_origins  Integer  default 0  — distinct O-Level schools that sent students here

created_at, updated_at  DateTime
```
Unique constraint: (centre_number, cycle_year).
Index: ix_sss_centre_year.
Relationship: `school` (many-to-one).

Important note from docstring: `outgoing_day` / `outgoing_boarding` are computed at ingestion time using the destination school's `accomodation` flag as it was known at ingestion. If a destination school's boarding status is later corrected, the affected cycle years must be recomputed. Location queries JOIN through the schools table live, so correcting a school's region_id / council_id / ward_id automatically fixes location-based queries without touching this table.

---

### 0.2 — The Transit Model (Import Only, Never Persisted)

`SelectionImportRow` (Pydantic schema, used during import only). Documents what the raw TAMISEMI data looks like and where each stored field comes from.

```
cand_number              str   — used for dedup only, discarded after import
full_name                str   — discarded, never stored
sex                      str   nullable — "M" | "F" — used for female_count/male_count splits
exam_year                int
exam_type                str   — "PSLE" | "CSEE"

primary_school_centre    str   nullable — PSLE origin
primary_school_name      str   nullable
primary_school_council   str   nullable
primary_school_region    str   nullable

olevel_school_centre     str   nullable — PSLE destination OR CSEE origin
olevel_school_name       str   nullable
olevel_school_council    str   nullable
olevel_school_region     str   nullable
olevel_school_status     str   nullable — KUTWA | BWENI | KATA | MKOA | TAIFA
                                          (PSLE: KUTWA/BWENI = boarding signal
                                           CSEE: KATA/MKOA = geographic scope of A-Level placement)

alevel_school_centre     str   nullable — CSEE A-Level destination (school)
alevel_school_name       str   nullable
alevel_school_council    str   nullable
alevel_school_region     str   nullable
alevel_school_status     str   nullable — geographic scope for this A-Level placement

selected_course          str   nullable — holds BOTH combination codes (PCM, HGE)
                                          AND college course codes — disambiguation at import
college_name             str   nullable — raw college name text, resolved to necta_colleges.id at import
```

How status values map to stored columns:
- `KUTWA` → `outgoing_day++`
- `BWENI` → `outgoing_boarding++`
- `KATA` → `outgoing_ward_scope++`
- `MKOA` → `outgoing_regional_scope++`
- Council-matching logic (not a raw status value — derived at import by comparing school council IDs) → `outgoing_council_scope++`
- Rows not matching any of the above scope → outside-region (derived, not stored)

---

### 0.3 — The Three Dimensions

Everything on this site is a product of three dimensions intersecting:

**Dimension 1 — Subject/Academic Content**: What is studied or examined. This covers NECTA subjects (individual), combinations (A-Level groupings like PCM, HGE), trades (vocational programmes), and courses/colleges (post-secondary). These are organized by specialization (Science, Arts, Business, Vocational).

**Dimension 2 — Geography**: Where the school is. Region → Council → Ward → Village/Street. Every piece of data can be sliced at any of these four geographic levels.

**Dimension 3 — Selections/Flow**: What happened to students after exams — which school or college they were selected into, which combination, which course, whether boarding or day, and how far they traveled.

The vast majority of pages on this site are intersections of these three dimensions applied across ~20,000 schools, 9 exam types, multiple years, and 4 geographic levels. That intersection space is what generates 500,000–2,000,000 pages.

### 0.4 — The Selections Status Values

From the raw data (`SelectionImportRow`):

- `KUTWA` — day school placement. The student goes home daily. Appears in PSLE destination status.
- `BWENI` — boarding school placement. The student lives at school. Appears in PSLE destination status.
- `KATA` — geographic scope of A-Level placement: same ward as the O-Level school.
- `MKOA` — geographic scope of A-Level placement: same region.
- Outside these = student placed outside their region.

These raw values are aggregated into `school_summary_stats` during import: KATA rows → `outgoing_ward_scope`, MKOA rows → `outgoing_regional_scope`, remaining A-Level rows (not KATA, not MKOA, not same council) → the derived outside-region count. KUTWA/BWENI → `outgoing_day` / `outgoing_boarding`.

The geographic scope breakdown (ward, council, regional, outside-region) is the most meaningful geographic signal in the selections data. A school where most A-Level bound students stay within their ward is sending students to nearby, typically less competitive schools. A school where students regularly go outside their region is placing students at schools that draw nationally — a different outcome for those families.

### 0.5 — What Doesn't Exist Yet (Planned Additions)

These fields are described in selections.md as planned additions but are NOT currently in the models. They should be added before the selections import pipeline is built:

- `school_summary_stats.approx_cohort_size` — derived from max candidate sequence number during PSLE import. Powers boarding rate per pupil (currently can only report raw counts, not rates against cohort).
- `school_summary_stats.yoy_change_pct`, `yoy_boarding_change`, `is_improving`, `is_declining` — year-over-year tracking. Powers the "improving schools" and "declining schools" discovery pages.

These are not in the codebase yet. Pages that depend on them are noted where relevant.

---

### 0.6 — Geographic hierarchy (all four levels, fully relational)

```
regions (31)
  └─ councils (~185)
       └─ wards (~3,000)
            └─ village_streets (deepest — not always populated)
```

Every school sits at all four levels via FK. Names are not stored on the school — you get the name by joining through the relationship: `school.region.region_name`, `school.council.council_name`, `school.ward.ward_name`, `school.village_street.village_street_name`.

### 0.2 — The Three Dimensions

Everything on this site is a product of three dimensions intersecting:

**Dimension 1 — Subject/Academic Content**: What is studied or examined. This covers NECTA subjects (individual), combinations (A-Level groupings like PCM, HGE), trades (vocational programmes), and courses/colleges (post-secondary). These are organized by specialization (Science, Arts, Business, Vocational).

**Dimension 2 — Geography**: Where the school is. Region → Council → Ward → Village/Street. Every piece of data can be sliced at any of these four geographic levels.

**Dimension 3 — Selections/Flow**: What happened to students after exams — which school or college they were selected into, which combination, which course, whether boarding or day, and how far they traveled.

The vast majority of pages on this site are intersections of these three dimensions applied across ~20,000 schools, 9 exam types, multiple years, and 4 geographic levels. That intersection space is what generates 500,000–2,000,000 pages.

### 0.3 — The Selections Status Values

From the raw data (`SelectionImportRow`):

- `KUTWA` — day school placement. The student goes home daily. Appears in PSLE destination status.
- `BWENI` — boarding school placement. The student lives at school. Appears in PSLE destination status.
- `KATA` — geographic scope of A-Level placement: same ward as the O-Level school.
- `MKOA` — geographic scope of A-Level placement: same region.
- Outside these = student placed outside their region.

These raw values are aggregated into `school_summary_stats` during import: KATA rows → `outgoing_ward_scope`, MKOA rows → `outgoing_regional_scope`, remaining A-Level rows (not KATA, not MKOA, not same council) → the derived outside-region count. KUTWA/BWENI → `outgoing_day` / `outgoing_boarding`.

The geographic scope breakdown (ward, council, regional, outside-region) is the most meaningful geographic signal in the selections data. A school where most A-Level bound students stay within their ward is sending students to nearby, typically less competitive schools. A school where students regularly go outside their region is placing students at schools that draw nationally — a different outcome for those families.

---

## PART 1 — SCHOOL PAGES

A school generates up to six distinct page types. Together these are the largest page category on the site (~80,000–120,000 pages, more as years accumulate).

---

### 1.1 — SCHOOL CORE PROFILE
**URL:** `/shule/{slug}`
**Page count:** ~20,000

This is the most-visited page type on the site. A parent searching "AZANIA SECONDARY Dar es Salaam" lands here. The page must answer in a single scroll: what this school is, where it is, how it has performed in exams, where its students go after they leave, and what it teaches. Each of those five answers is a section. Each section ends with a link to its own deeper page.

**Identity block** — The first thing the user sees.

If `is_inactive = true`, a full-width red alert renders above the school name: this school is no longer operating. This is the most critical fact about a school and must not be discoverable only by scrolling.

The H1 is `school_name`. Below it sits a breadcrumb that also serves as navigation and structured data: Tanzania → `region_name` (link to `/mkoa/{slug}`) → `council_name` (link to `/halmashauri/{slug}`) → `ward_name` (link to `/kata/{slug}`). Each level is a hyperlink.

A horizontal row of status badges communicates the school's character at a glance. Each badge is derived from the model fields:

- School type: GOVERNMENT (from `school_type = GOVERNMENT`) or PRIVATE
- Accommodation: BWENI / KUTWA / BWENI NA KUTWA (from `accomodation`)
- Gender: WAVULANA-TU, WASICHANA-TU, or MCHANGANYIKO (derived from `is_olevel_boys/girls`, `is_alevel_boys/girls`, `is_mixture`, `is_unisex`)
- Boarding per level (if school has multiple levels): "O-Level Bweni", "A-Level Bweni" (from `is_olevel_boarding`, `is_alevel_boarding`)
- Levels offered (only show true flags): PRIMARY · O-LEVEL · A-LEVEL · VOCATIONAL · TECHNICAL · PRE-PRIMARY
- Special badges (only if true): SHULE MAALUM (`is_special`), INAKUBALI ULEMAVU (`is_inclusive`), MTAALA MPYA (`is_new_curriculum`), KIDINI (`is_religious`), KITUO TU (`is_private_centre` — exam-only centres have no students, only registered candidates)

A two-column identity block sits below the badges:
- Left: NECTA Centre Number (`centre_number`), Registration Number (`reg_number`), Registration Date (`registration_date`)
- Right: Ownership (`ownership`, `ownership_category`, `school_ownership`), School level string from NECTA (`school_level`), website link if `school_website` is set

**The registration date produces a historically significant badge.** If `registration_date` is before 1960, the school receives a second badge: "Miongoni mwa Shule za Kwanza Tanzania" and a link to `/orodha/shule-kongwe`. This answers one of the most-searched historical queries about Tanzanian education directly on the school's own page, converting a factual record into a SEO asset and a compelling user story.

If `latitude` and `longitude` are both present, a Google Maps embed fills the right column. Below it: `school_address` and `location_details` as plain text.

**NECTA results summary** — A fast-read performance block. The purpose here is not depth — the full results page has depth. The purpose is to give enough to orient the user and motivate a click to the full page.

For each exam type this school has data for, and for the three most recent years, one summary card per year. The card shows: exam type label, year, registered count, sat count, passed count, pass percentage, GPA (from `necta_school_ranks`), and division breakdown (Div I / II / III / IV / 0, from `necta_result_analysis.analysis` JSONB). A year-over-year direction indicator sits next to the GPA (↑ or ↓ versus prior year). The only link in the card goes to the full results page for that exam type and year.

Cards are ordered: CSEE first (most-searched), ACSEE second, PSLE third, others in order of education level.

**Selections summary — for primary schools** (shown when `is_primary = true`, from `school_summary_stats` WHERE `cycle_year` = selected year, `centre_number` = this school, role = origin, exam type = PSLE):

The headline row shows four numbers: total students selected, female count, male count, boarding rate percentage. These come from `outgoing_total`, `outgoing_female`, `outgoing_male`, and (`outgoing_boarding / outgoing_alevel * 100`) — noting that for PSLE, outgoing_alevel contains all secondary selections (the field name reflects the CSEE use case but the column serves both flows).

Below the headline, a bar chart of the top five destination secondary schools (from `school_flow_stats` WHERE `origin_centre_number = X AND cycle_year = Y`, grouped by destination, ordered by student_count DESC, top 5). Each bar shows the destination school name with a link to its profile, and the student count. The gender split (female_count / male_count) appears inline.

The two-hop pipeline insight: for each of the top five destinations, if that destination school's `outgoing_alevel` rate (from its own `school_summary_stats`) is high — meaning a large fraction of its Form 4s get A-Level selections — surface this inline below the destination entry. It makes the abstract concept concrete: this primary school's students go to a secondary school that reliably produces A-Level candidates.

Year selector: separate URL per year (`/shule/{slug}/uchaguzi/{year}`), not a dropdown that swaps data.

Link to the full selections page: `/shule/{slug}/uchaguzi`.

**Selections summary — for O-Level schools** (shown when `is_olevel = true`, from `school_summary_stats` CSEE role):

The headline row: total outgoing, A-Level count, college count, and the selection rate (A-Level count divided by the number who sat CSEE that year, from `necta_school_ranks.sat` — this is the percentage of CSEE sitters who earned A-Level places, the most meaningful single quality number this page can show).

The boarding vs day split of A-Level bound students: `outgoing_boarding` vs `outgoing_day`. These are counts of students who went to boarding schools vs day schools for A-Level. A school with high boarding count is sending students to schools that take boarders from far away — typically more competitive.

The geographic scope breakdown. This deserves prominent visual treatment, not a footnote. Four rows:

```
Within same ward         [outgoing_ward_scope]    students
Within same council      [outgoing_council_scope] students
Within same region       [outgoing_regional_scope] students
Outside region           [derived]                students
```

The derived row is `outgoing_alevel - outgoing_ward_scope - outgoing_council_scope - outgoing_regional_scope`. These four add up to `outgoing_alevel`. This breakdown tells a parent how far this school's successful students typically travel — whether they tend to be placed nearby or at schools across the country.

Top six combinations received by this school's outgoing students (from `school_comb_stats` WHERE `origin_centre_number = X AND cycle_year = Y`, grouped by `comb_code`, ordered by total DESC, top 6). For each: combination code with link to `/mchanganyiko/{slug}`, total student count, female count, male count.

Top five destination A-Level schools (from `school_comb_stats`, grouped by `destination_centre_number`, ordered by total DESC, top 5). For each: school name with link to its profile, total student count.

Top five college courses (from `school_course_stats` WHERE `origin_centre_number = X AND cycle_year = Y`, grouped by `course_slug`, ordered by total DESC, top 5). For each: course name with link to `/kozi/{slug}`, college name with link to `/chuo/{slug}`, count.

Link to full selections page: `/shule/{slug}/uchaguzi`.

**Selections summary — for A-Level schools** (shown when `is_alevel = true`, from `school_summary_stats` incoming role):

Incoming total, female, male, number of distinct feeder schools (`incoming_origins`). Top five feeder O-Level schools (from `school_flow_stats` WHERE `destination_centre_number = X AND cycle_year = Y`, grouped by origin, ordered by student_count DESC, top 5). Combination breakdown of what arriving students were placed in (from `school_comb_stats` WHERE `destination_centre_number = X AND cycle_year = Y`, grouped by `comb_code`).

Link to full selections page: `/shule/{slug}/uchaguzi`.

**Academic offer — subjects, combinations, trades** (from `necta_subject_schools`, `necta_comb_schools`, `necta_trade_schools` WHERE `is_present = true`):

Three separate rows or tabs: Subjects (each with link to `/somo/{slug}`), Combinations if A-Level (each with link to `/mchanganyiko/{slug}`), Trades if vocational (each with link to `/biashara/{slug}`).

**Nearby schools** — 5–8 schools in the same ward or council with the same level flag, each linked to their profile. Derived by querying `schools` WHERE `ward_id = X` OR `council_id = Y`, filtered to same `is_olevel` / `is_alevel` / `is_primary`, excluding the current school.

**SEO:**
```
title: "{school_name} — Matokeo NECTA, Masomo, Uchaguzi | ShuleYetu"
meta:  "{school_name} iko {ward_name}, {council_name}, {region_name}.
        Matokeo {latest_exam_type} {latest_year}, uchaguzi wa wanafunzi, 
        masomo na mchanganyiko. Taarifa kamili."
JSON-LD: EducationalOrganization with address, geo coordinates, url
Breadcrumb: Tanzania > {region} > {council} > {ward} > {school_name}
```

**Internal links out:** profile → results pages (per exam/year), profile → selections pages (per year), profile → subjects page, profile → combinations page, profile → trades page, profile → region page, profile → council page, profile → ward page, profile → every destination school (in selections summary), profile → every feeder school (A-Level incoming), profile → every college destination, profile → every combination, profile → nearest schools, profile → `/orodha/shule-kongwe` if old.

---

### 1.2 — SCHOOL RESULTS PAGE
**URL:** `/shule/{slug}/matokeo/{exam_type}/{year}`
**Page count:** ~20,000 schools × 9 exam types × 5 years = up to 900,000 (prioritize CSEE × 3 years = ~60,000 first)

This page is what parents and students search for most urgently, especially during and just after results season. It must be thorough, fast-loading, and self-contained.

**Header:** School name, exam type label, year. Breadcrumb back to school profile. Year navigation: links to previous year and next year for the same school and exam type (if data exists).

**Headline stats block:**
- Registered (`necta_school_ranks.registered`)
- Sat (`necta_school_ranks.sat`)
- Passed (`necta_school_ranks.passed`)
- Pass rate (derived: passed / sat × 100)
- GPA (`necta_school_ranks.school_gpa`)
- School average (`necta_school_ranks.school_average`)
- Division breakdown from `necta_result_analysis.analysis` JSONB: Div I, II, III, IV, 0 as counts and percentages

**Position context** — from `necta_school_ranks.ranking` JSONB which contains position at national, regional, and council levels. Show: "Among schools nationally: top X of Y" / "In {region_name}: top X of Y" / "In {council_name}: top X of Y". Do not say "ranked #1" — say "among the top X in the region."

**Subject-level results** (from `necta_subject_ranks` WHERE `school` = this, `exam_year` = this, `exam_type` = this):

A table with one row per subject. Columns: subject name (link to `/somo/{slug}`), subject code, registered, sat, passed, pass rate, GPA. Sortable by each column. For ACSEE, columns also show average points.

**Year-over-year trend** — if data exists for multiple years, a simple table (not a chart — charts are complex to render at scale) showing GPA and pass rate for each available year. This lets a parent see trajectory: is this school improving, stable, or declining?

**Links to related pages:**
- Subject pages for each subject in the results table
- Back to school profile
- Same exam type, same year, for nearby schools (top 3 linked)
- Regional results hub for this exam type and year

**SEO:**
```
title: "Matokeo {exam_type} {year} — {school_name} | ShuleYetu"
meta:  "{school_name} matokeo {exam_type} {year}: waliofanya {sat}, 
        waliofaulu {passed} ({pass_rate}%), GPA {gpa}."
```

---

### 1.3 — SCHOOL SELECTIONS PAGE
**URL:** `/shule/{slug}/uchaguzi/{year}`
**Page count:** ~20,000 schools × available years (~3–5) = ~60,000–100,000

This is the deep dive into where this school's students went. There are two versions of this page: the origin view (for O-Level schools — where did our Form 4s go?) and the destination view (for A-Level schools — where did our Form 5s come from?). A school that is both origin and destination shows both sections on the same page.

**For O-Level schools — the outgoing story:**

The page opens with the same headline stats from the profile's selections summary block, now with full depth below it.

The geographic scope section gets a full breakdown here, not the summary version. The four scope rows (ward, council, regional, outside-region) are shown with counts and percentages of outgoing_alevel. A brief explanation of what each scope means in practical terms: a student placed within their ward went to a school nearby; a student placed outside their region was selected for a school drawing from a national pool.

The boarding vs day split: `outgoing_boarding` and `outgoing_day` with context. Boarding rate compared to the council average and the national average (from `comb_stats` or by aggregating `school_summary_stats` at the council and national level).

**Full combination breakdown** — every combination code that appears in `school_comb_stats` for this school and year, with total count, female count, male count, and the specific A-Level schools that received students for each combination. Layout:

```
PCM — 34 students (F: 8, M: 26)
    ├── TAMBAZA HIGH SCHOOL       14 students → /shule/...
    ├── JANGWANI HIGH SCHOOL       9 students → /shule/...
    └── AZANIA SECONDARY           11 students → /shule/...

HGE — 28 students (F: 19, M: 9)
    ├── MKWAWA HIGH SCHOOL        16 students → /shule/...
    └── KILAKALA GIRLS            12 students → /shule/...
```

Each combination links to its national page. Each destination school links to its profile.

**Full college destinations** — every college that appears in `school_course_stats` for this school and year. For each college: college name (link to `/chuo/{slug}`), total students, gender split, and the courses within that college that students entered (each course with count).

**Year comparison** — a table showing the key outgoing metrics for all available years side by side: total, A-Level count, college count, boarding count, outside-region count. Each year links to the same page for that year.

**For A-Level schools — the incoming story:**

Incoming total, female, male, `incoming_origins`. Full list of all feeder O-Level schools (from `school_flow_stats` WHERE `destination = this school AND cycle_year = Y`), ordered by student count descending. For each feeder: school name (link), region and council (links), student count, female count, male count.

Combination breakdown of incoming students (from `school_comb_stats` WHERE `destination = this AND cycle_year = Y`, grouped by `comb_code`): which combinations students were placed in at this school, with gender splits.

Geographic origin of incoming students: by aggregating feeder schools' region_ids, show how many students came from each region. This tells a user whether this A-Level school draws nationally or is a regional school.

**SEO:**
```
title: "Uchaguzi {year} — {school_name}: Mchanganyiko, Vyuo, Hatua | ShuleYetu"
meta:  "Wanafunzi {outgoing_total} kutoka {school_name} walipata uchaguzi {year}. 
        A-Level: {outgoing_alevel}. Vyuo: {outgoing_college}. 
        Mchanganyiko maarufu: {top_comb}."
```

---

### 1.4 — SCHOOL SUBJECTS PAGE
**URL:** `/shule/{slug}/masomo`
**Page count:** ~20,000

Lists all subjects this school offers (from `necta_subject_schools` WHERE `centre_number = X AND is_present = true`), each linked to `/somo/{subject_slug}` and to `/somo/{subject_slug}/shule/{slug}` (the school × subject performance page). If the school has NECTA subject rank data, shows each subject's most recent GPA inline.

---

### 1.5 — SCHOOL COMBINATIONS PAGE
**URL:** `/shule/{slug}/mchanganyiko`
**Page count:** ~5,000 (A-Level schools only)

Lists all combinations this school offers (from `necta_comb_schools` WHERE `centre_number = X AND is_present = true`). For each combination: code, full name, subjects inside it (from `necta_comb_subjects`), link to the national combination page, and the count of students who were selected into this combination at this school in the most recent year (from `school_comb_stats` WHERE `destination = this`).

---

### 1.6 — SCHOOL TRADES PAGE
**URL:** `/shule/{slug}/biashara`
**Page count:** ~2,000 (vocational schools only)

Lists all trades this school offers (from `necta_trade_schools` WHERE `centre_number = X AND is_present = true`). Each trade links to `/biashara/{slug}`. Shows specialization category. Shows exam type (GATSCCE or GATCE).

---

## PART 2 — SELECTIONS PAGES (THE UNIQUE LAYER)

These pages exist independently of school profiles. They aggregate selections data across schools to answer geographic, combination-level, and flow questions at scale. They are the most analytically rich pages on the site and have the least competition in search.

---

### 2.1 — NATIONAL SELECTIONS HUB
**URL:** `/uchaguzi`

The entry point for selections data at national level. Shows for the most recent year: total students selected nationally (sum of `outgoing_total` across all schools), A-Level vs college split, boarding vs day split of A-Level selections, top 10 combinations nationally by total placed (from `comb_stats` WHERE `region_id IS NULL`), top 10 most-incoming A-Level schools nationally (from `school_summary_stats`, ordered by `incoming_total`), top 10 most-outgoing O-Level schools. Links to all sub-pages.

---

### 2.2 — NATIONAL SELECTIONS BY YEAR
**URL:** `/uchaguzi/{year}`

Year-specific national overview. Same content as 2.1 but scoped to a specific year. Year navigation links. Comparison table across available years (were more students selected this year than last?).

---

### 2.3 — COMBINATION NATIONAL PAGE
**URL:** `/mchanganyiko/{comb_slug}`
**Page count:** ~15–20 (one per combination)

This is the SEO goldmine page for each combination. A parent searching "PCM Tanzania" or "what is HGE combination" lands here.

**Combination identity:** Full name, subjects inside it (from `necta_comb_subjects`, each subject linked to `/somo/{slug}`), specialization category (from `necta_specializations`), career pathways (from `necta_combs.career_pathways`), description.

**National statistics** (from `comb_stats` WHERE `region_id IS NULL AND council_id IS NULL AND ward_id IS NULL AND comb_code = X`):

For each available year: `total_placed`, `female_count`, `male_count`, `schools_receiving` (how many A-Level schools offered this combination), `schools_originating` (how many O-Level schools had students selected into this combination). Show as a year-over-year table. Is this combination growing or shrinking? Is the female share changing?

**Top A-Level schools for this combination** (from `school_comb_stats` WHERE `comb_code = X AND cycle_year = latest`, grouped by `destination_centre_number`, ordered by total DESC, top 10). Each school links to its profile and its combinations page.

**Top O-Level feeder schools** (from `school_comb_stats` WHERE `comb_code = X AND cycle_year = latest`, grouped by `origin_centre_number`, ordered by total DESC, top 10). These are the O-Level schools whose Form 4 students most frequently earn this combination. Each links to its profile.

**Regional breakdown** — for the most recent year, how many students received this combination in each region (from `comb_stats` WHERE `comb_code = X AND region_id IS NOT NULL AND council_id IS NULL`). Ordered by total. Each region links to `/mchanganyiko/{comb_slug}/mkoa/{region_slug}`.

**Gender analysis** — nationally, what percentage female vs male for this combination? Is this changing year on year? Which O-Level schools have the highest female rates for this combination?

**Related combinations** — other combinations in the same specialization, linked.

**SEO:**
```
title: "Mchanganyiko {CODE} — {full_name}: Shule, Takwimu, Njia | ShuleYetu"
meta:  "Mchanganyiko {CODE} ({full_name}) Tanzania: shule {schools_receiving} 
        zinazotoa, wanafunzi {total_placed} waliochaguliwa {latest_year}. 
        Masomo: {subjects_list}."
```

---

### 2.4 — COMBINATION × REGION PAGE
**URL:** `/mchanganyiko/{comb_slug}/mkoa/{region_slug}`
**Page count:** ~15 combinations × 31 regions = ~465

Regional breakdown of one combination. Regional total, female, male from `comb_stats` WHERE `comb_code = X AND region_id = Y AND council_id IS NULL`. Year-over-year trend. Top A-Level schools in this region for this combination. Top O-Level feeder schools from this region. Council breakdown within the region (from `comb_stats` WHERE `comb_code = X AND region_id = Y AND council_id IS NOT NULL AND ward_id IS NULL`). Each council links to `/mchanganyiko/{comb_slug}/halmashauri/{council_slug}`.

---

### 2.5 — COMBINATION × COUNCIL PAGE
**URL:** `/mchanganyiko/{comb_slug}/halmashauri/{council_slug}`
**Page count:** ~15 × ~185 = ~2,775

Same pattern as 2.4 but at council level. Council total from `comb_stats`. Top schools in this council for this combination. Ward breakdown within the council from `comb_stats`.

---

### 2.6 — SCHOOL FLOW MAP
**URL:** `/mtiririko/{exam_type}/{year}`

An analytical page showing the top school-to-school flows for a given exam type and year. Derived from `school_flow_stats`. Shows top 50 flows by student_count with origin school, destination school, count, and female/male split. Each school name is a link. Below it: links to specific origin and destination school selections pages.

---

## PART 3 — LOCATION PAGES

There are three tiers of location pages. Each tier aggregates everything the tier below it has, plus adds tier-specific context.

---

### 3.1 — REGION HUB
**URL:** `/mkoa/{region_slug}`
**Page count:** 31

The region page is one of the highest-traffic location pages because region names appear in many search queries ("shule Arusha", "best schools in Mwanza"). It answers: what is the education landscape of this region?

**School counts:** total schools in region (query `schools` WHERE `region_id = X`). Breakdown by type (GOVERNMENT vs PRIVATE), by level (primary, O-Level, A-Level, vocational), by accommodation (boarding vs day). Each count is a link to a filtered list page.

**Councils:** list of all councils in this region, each linked to `/halmashauri/{slug}`. Sorted by school count.

**NECTA performance:** For CSEE and ACSEE (the two most-searched), the regional picture across available years. Average GPA across schools in the region, number of schools with results, number of Division I performers. Source: aggregate `necta_school_ranks` by `region_id`. Trend table (year vs average GPA).

**Selections overview:** (from `school_summary_stats` aggregated by joining to `schools.region_id = X`): total outgoing A-Level selections for schools in this region, total college selections, boarding rate, outside-region placement rate (outside-region count / total A-Level × 100). Comparison to national average.

**Combination profile of this region:** from `comb_stats` WHERE `region_id = X AND council_id IS NULL`, for the most recent year. Top 5 combinations by `total_placed`. Links to `/mchanganyiko/{comb_slug}/mkoa/{region_slug}` for each.

**Subject performance leaders:** Top 5 subjects by average GPA across schools in this region. Source: aggregate `necta_subject_ranks` by `region_id`.

**Schools by category:** links to filtered lists:
- Government schools → `/orodha/shule?mkoa={slug}&aina=serikali`
- Private schools → `/orodha/shule?mkoa={slug}&aina=binafsi`
- Boarding schools → `/orodha/shule?mkoa={slug}&malazi=bweni`
- Girls schools → `/orodha/shule?mkoa={slug}&jinsia=wasichana`
- Etc.

**SEO:**
```
title: "Shule za {region_name} — Matokeo, Uchaguzi, Mchanganyiko | ShuleYetu"
meta:  "Shule {school_count} za {region_name}. Matokeo NECTA, mchanganyiko wa 
        A-Level, na uchaguzi wa wanafunzi. Halmashauri {council_count}."
```

---

### 3.2 — REGION RESULTS PAGE
**URL:** `/mkoa/{region_slug}/matokeo/{exam_type}/{year}`
**Page count:** 31 regions × 9 exam types × 5 years = ~1,395

All schools in this region with results for this exam type and year. Sorted by GPA (ascending — lower GPA is better in Tanzania's system). Source: `necta_school_ranks` JOIN `schools` WHERE `region_id = X AND exam_year = Y`. Shows school name, GPA, pass rate, division breakdown. Each school links to its full results page.

---

### 3.3 — REGION SELECTIONS PAGE
**URL:** `/mkoa/{region_slug}/uchaguzi/{year}`
**Page count:** 31 × ~5 years = ~155

Aggregated selections data for all schools in this region. Total outgoing from region's O-Level schools (aggregate `school_summary_stats` WHERE schools.region_id = X). Geographic scope breakdown for the region (what fraction of the region's A-Level bound students stayed within ward, council, region vs went outside). Top 10 destination A-Level schools for students from this region (from `school_flow_stats`, join origin school to get region). Top 10 origin O-Level schools for A-Level schools in this region (incoming perspective). Combination profile: top combinations from `comb_stats` WHERE `region_id = X`. College destinations: top colleges receiving students from this region.

---

### 3.4 — COUNCIL HUB
**URL:** `/halmashauri/{council_slug}`
**Page count:** ~185

Same structure as region hub but scoped to council. Council pages are particularly important for equity analysis — the variation in education outcomes between councils is enormous and parents, NGOs, and researchers search at this level. Links up to parent region page and down to ward pages.

---

### 3.5 — COUNCIL RESULTS PAGE
**URL:** `/halmashauri/{council_slug}/matokeo/{exam_type}/{year}`
**Page count:** ~185 × 9 × 5 = ~8,325

---

### 3.6 — COUNCIL SELECTIONS PAGE
**URL:** `/halmashauri/{council_slug}/uchaguzi/{year}`
**Page count:** ~185 × 5 = ~925

Same pattern as region selections but scoped to council. The council-level geographic scope breakdown is where the equity story becomes clearest: a council where all students stay within their ward is a council with limited A-Level access. A council whose students spread nationally has strong academic output.

---

### 3.7 — WARD HUB
**URL:** `/kata/{ward_slug}`
**Page count:** ~3,000

School list for this ward. Fewer analytics (low school count per ward), more discovery. Links up to council page and down to individual school profiles. Breadcrumb: Tanzania → Region → Council → Ward.

---

## PART 4 — SUBJECT PAGES

Subjects are the individual components of exams. Each subject has a national page and regional breakdowns. These pages serve students preparing for exams and parents understanding subject performance.

---

### 4.1 — SUBJECT NATIONAL PAGE
**URL:** `/somo/{subject_slug}`
**Page count:** ~100+ subjects × 9 exam types (where relevant) = ~300–600

What this subject is, which exam type it belongs to, its code. National performance: aggregate `necta_subject_ranks` across all schools for this subject and exam type across available years. Average GPA trend. Top-performing schools (from `necta_subject_ranks`, ordered by GPA ascending, top 10) — each linked to their profile. Schools offering this subject (from `necta_subject_schools` WHERE `subject_code = X AND is_present = true`, count and list). Regional breakdown: which regions have the highest average GPA for this subject. Links to regional subject pages.

---

### 4.2 — SUBJECT × REGION PAGE
**URL:** `/somo/{subject_slug}/mkoa/{region_slug}`
**Page count:** ~300 subjects × 31 regions = ~9,300

Subject performance aggregated for schools in this region. Average GPA, top schools, trend over years. Link to national subject page and to council-level subject pages.

---

### 4.3 — SUBJECT × SCHOOL PAGE
**URL:** `/somo/{subject_slug}/shule/{school_slug}`
**Page count:** ~100 subjects × ~20,000 schools (only where `is_present = true`) = variable

Performance of this subject at this specific school across years. Trend table. Link back to school profile and subject national page.

---

## PART 5 — TRADE PAGES

Trades are vocational programmes under GATSCCE and GATCE. They have their own page type, parallel to combinations but for vocational schools.

---

### 5.1 — TRADE NATIONAL PAGE
**URL:** `/biashara/{trade_slug}`
**Page count:** ~50

What this trade is (from `necta_trades.description`, `career_prospects`), which exam type (GATSCCE or GATCE), specialization category. Schools offering it (from `necta_trade_schools` WHERE `trade_id = X AND is_present = true`, each linked). Regional distribution of schools offering this trade. Link to regional pages.

---

### 5.2 — TRADE × REGION PAGE
**URL:** `/biashara/{trade_slug}/mkoa/{region_slug}`
**Page count:** ~50 × 31 = ~1,550

Schools offering this trade in this region. Regional context: is this trade common or rare here?

---

## PART 6 — COLLEGE AND COURSE PAGES

Colleges (`necta_colleges`) are separate entities from schools. They appear as destinations in CSEE selections data. Each college and each course within it gets its own page.

---

### 6.1 — COLLEGE HUB
**URL:** `/vyuo`

List of all colleges in `necta_colleges` WHERE `is_active = true`. Filterable by `college_type` (Teachers / Nursing / Health / Technical / Agriculture / Vocational). Count of students received per college in the most recent year (from `school_course_stats`, aggregated by `college_id`). Links to individual college profiles.

---

### 6.2 — COLLEGE PROFILE
**URL:** `/chuo/{slug}`
**Page count:** ~300

From `necta_colleges`: name, type, region (joined via `region_id`), website, description.

**Intake statistics** (from `school_course_stats` WHERE `college_id = X AND cycle_year = Y`): total students received, female count, male count. Year-over-year trend (is this college growing or shrinking in intake?).

**Courses offered** at this college (from `necta_courses` WHERE `college_id = X`): each course name, duration, specialization category, link to `/kozi/{course_slug}`.

**Course breakdown by intake** (from `school_course_stats` GROUP BY `course_slug`): for the most recent year, how many students per course. Top courses by intake volume.

**Top feeder O-Level schools** (from `school_course_stats` WHERE `college_id = X AND cycle_year = Y`, grouped by `origin_centre_number`, ordered by total DESC, top 10). Each links to its school profile.

**Regional origin of students** (from `school_course_stats`, join origin school to get region): which regions send most students to this college? This shows the college's geographic draw.

**Year selector:** separate URL per year (`/chuo/{slug}/{year}`).

**SEO:**
```
title: "{college_name} — Kozi, Wanafunzi, Shule za Chini | ShuleYetu"
meta:  "{college_name}: chuo cha {college_type} Tanzania. Wanafunzi 
        {total_latest_year} waliochaguliwa {latest_year}. 
        Kozi: {top_courses_list}."
```

---

### 6.3 — COURSE PAGE
**URL:** `/kozi/{course_slug}`
**Page count:** ~2,000

From `necta_courses` JOIN `necta_colleges`: course name, which college(s) offer it, duration, description, specialization.

**National intake for this course** (from `school_course_stats` WHERE `course_slug = X`, across years): total students, female, male. Year-over-year trend. Is this course growing (more students being selected) or declining? This trend question is one of the most valuable things this page can answer — no other Tanzanian site provides course-level demand data.

**Colleges offering this course** (from `school_course_stats` WHERE `course_slug = X AND cycle_year = latest`, grouped by `college_id`): each college with student count for this course. Links to college profiles.

**Top feeder O-Level schools** (from `school_course_stats` WHERE `course_slug = X AND cycle_year = latest`, grouped by `origin_centre_number`, ordered by DESC, top 10).

**Gender analysis:** what percentage of students in this course are female? How has this changed over available years?

---

### 6.4 — COURSE TRENDS PAGE
**URL:** `/kozi/mwelekeo`

An editorial-style page showing courses growing fastest in selections nationally, courses declining, and courses with notable gender shifts. Powered by year-over-year comparison of `school_course_stats` totals grouped by `course_slug`. Highly shareable and linkable — journalists and researchers search this.

---

## PART 7 — RANKING AND DISCOVERY PAGES

Rankings generate persistent traffic because parents, students, and journalists search for "best schools in Tanzania" constantly. The site does not claim a specific numerical rank (#1, #2) — it presents performance data and lets the data speak. Phrasing: "Among the top-performing schools" / "Consistently strong GPA" / "Top 10 in Mwanza region."

---

### 7.1 — NATIONAL RESULTS HUB
**URL:** `/matokeo/{exam_type}/{year}`
**Page count:** 9 exam types × 5 years = ~45 (critical — build before results drop)

The page that receives the spike traffic when NECTA releases results. Must be built and indexed before results season.

Shows national summary for this exam type and year: total registered, total sat, total passed, national pass rate. Distribution of schools by GPA range. Links to school profiles for schools with results. School filter: government vs private, region filter. Link to regional breakdowns.

The results hub for CSEE is the single highest-traffic page on the site during results season. Every school that sat CSEE links here from its profile. Google should find this page fast.

**SEO:**
```
title: "Matokeo {EXAM_TYPE_NAME} {year} Tanzania — Shule Zote | ShuleYetu"
meta:  "Matokeo {EXAM_TYPE_NAME} {year}: shule {school_count}, 
        waliofaulu {passed_count} ({pass_rate}%). Tafuta shule yako."
```

---

### 7.2 — REGIONAL RESULTS HUB
**URL:** `/matokeo/{exam_type}/{year}/mkoa/{region_slug}`
**Page count:** 9 × 5 × 31 = ~1,395

All schools in this region with results for this exam. Sorted by GPA. Filter: government/private. Each school links to its results page.

---

### 7.3 — SCHOOL DISCOVERY / FILTER PAGES
**URL:** `/orodha/shule`
**URL variants:** `/orodha/shule?mkoa={slug}&aina=serikali&malazi=bweni&ngazi=olevel&jinsia=wasichana`

The filter page serves queries like "government boarding girls secondary schools in Arusha." Every combination of filters gets its own crawlable URL (or is generated on-demand and cached). Filters derive from school boolean flags: school_type, accomodation, is_olevel/is_alevel/is_primary, is_olevel_girls/boys, is_inclusive, is_special. Each filtered result set is a list of school cards with names, locations, and links.

**Key pre-built filter pages** (high search volume):
- `/orodha/shule/serikali` — government schools
- `/orodha/shule/binafsi` — private schools
- `/orodha/shule/bweni` — boarding schools
- `/orodha/shule/wasichana` — girls schools
- `/orodha/shule/wavulana` — boys schools
- `/orodha/shule/maalum` — special needs schools
- `/orodha/shule/kongwe` — historically old schools (registration_date before 1960)
- Each of the above × each region = ~8 types × 31 regions = ~248 additional pages

---

### 7.4 — SCHOOL COMPARISON PAGE
**URL:** `/linganisha/{slug-a}/vs/{slug-b}`
**Page count:** ~1,000 most-common pairs (pre-built), unlimited on demand

Side-by-side comparison of two schools. For each: identity, exam type results (latest year GPA, pass rate, division breakdown), selections profile (outgoing A-Level rate, boarding rate, geographic scope), combinations offered, location. Both school profile links. This captures "school A vs school B" search queries that parents make constantly when choosing between two schools.

---

### 7.5 — OLDEST SCHOOLS PAGE
**URL:** `/orodha/shule-kongwe`

All schools with `registration_date` before 1960, ordered by date ascending. A historical and SEO asset. Each school card shows name, registration date, region, and links to its profile where the "Miongoni mwa Shule za Kwanza Tanzania" badge also appears.

---

## PART 8 — EXAM EXPLAINER PAGES

One page per exam type. Static but rich. Explains what the exam is, who sits it, when results come out, how grading works, what happens after (selections logic). These pages capture the "what is CSEE" / "CSEE maana" / "jinsi ya kujua matokeo ya PSLE" search queries that are high-volume and have no good existing answers.

**URL:** `/mtihani/{exam_type_slug}`
**Page count:** 9

Content from `necta_exam_types.description` plus editorial content about: education level, grading scale, subject list, timeline, and what follows (selections process). Links to the results hub for this exam type.

---

## PART 9 — SEO AND MONETIZATION INTEGRATION

### 9.1 — Page title and meta strategy

Every page title follows the pattern: `{specific content} — {location/context} | ShuleYetu`. Every meta description contains the two or three numbers a user needs to decide to click: school count, student count, GPA, pass rate — whichever is most relevant. Generic descriptions ("Learn about schools in Tanzania") do not appear anywhere.

### 9.2 — Internal linking architecture

The internal link network is the SEO engine. No page is an island. The rules:

- Every school profile links to its region, council, ward, and all destination schools in its selections data.
- Every combination page links to all schools that offer it and all O-Level schools that send students into it.
- Every results page links to the subject pages for every subject in the results table.
- Every location page links to all school profiles within it.
- Every college page links to all feeder O-Level schools.
- Every course page links to all colleges offering it.
- Every subject page links to the combinations that contain it.
- Breadcrumbs on every page: full hierarchy, every level linked.

This creates a link graph where any page is reachable from any other page within two to three clicks, and where Google's crawler can reach every page from the homepage through natural link traversal.

### 9.3 — Year-per-URL rule and ad revenue

The year selector on every data page (results, selections, combinations) renders a separate URL per year. This is a hard rule, not a preference. The reasons:

1. Each year URL gets its own Google index entry. A school with 5 years of results has 5 indexed results pages, each capturing year-specific queries ("matokeo CSEE 2022 AZANIA SECONDARY").
2. Every page load = one ad impression session. A client-side swap of data without a page load generates zero additional ad revenue. Five years of results = five pages = five times the ad impressions per school.
3. Year-specific pages are canonical and shareable. A parent shares the 2024 results link with family. That link remains valid permanently and accumulates inbound links over time.

### 9.4 — Ad placement logic

Three ad slots on every page:

- **Slot 1:** Below the hero / identity block, before the first data section. This is the highest-CTR position because users have read the page name and are about to engage with data — they are in an attention state.
- **Slot 2:** Between the results/selections summary and the deeper data sections (between the "what happened" and the "full detail" zones).
- **Slot 3:** At the bottom, after all content, before the footer links.

On results hub pages during results season, an additional high-visibility slot appears at the top (above the school list). This is the highest-revenue slot on the site and should be reserved for direct ad sales (universities, tutoring centres, exam prep services) rather than programmatic.

### 9.5 — Build priority order

**Phase 1 — Core (build first, before anything else):**
All 20,000 school profiles. The results hub pages for CSEE × latest 3 years. The national combination pages for all combinations. The 31 region hub pages. The 9 exam explainer pages. Submit sitemaps.

**Phase 2 — Expand:**
School results pages (CSEE × 3 years = ~60,000 pages). Regional results hubs. National subject pages. Combination × region pages. College profiles. Council hub pages.

**Phase 3 — Long-tail:**
School selections pages. Council results and selections pages. Course pages. Subject × region pages. School filter pages. Ward hub pages. School comparison pages.

**Phase 4 — Compound:**
Subject × council pages. Combination × council pages. Ward-level subject pages. Historical year coverage (4–5 years back). Trend and discovery pages.

---

## PART 10 — COMPLETE PAGE COUNT MATRIX

| Page type | URL pattern | Count |
|---|---|---|
| School core profiles | `/shule/{slug}` | ~20,000 |
| School results pages | `/shule/{slug}/matokeo/{exam}/{year}` | ~60,000–900,000 |
| School selections pages | `/shule/{slug}/uchaguzi/{year}` | ~60,000–100,000 |
| School subjects pages | `/shule/{slug}/masomo` | ~20,000 |
| School combinations pages | `/shule/{slug}/mchanganyiko` | ~5,000 |
| School trades pages | `/shule/{slug}/biashara` | ~2,000 |
| Combination national | `/mchanganyiko/{slug}` | ~20 |
| Combination × region | `/mchanganyiko/{slug}/mkoa/{slug}` | ~620 |
| Combination × council | `/mchanganyiko/{slug}/halmashauri/{slug}` | ~3,700 |
| Trade national | `/biashara/{slug}` | ~50 |
| Trade × region | `/biashara/{slug}/mkoa/{slug}` | ~1,550 |
| Subject national | `/somo/{slug}` | ~300–600 |
| Subject × region | `/somo/{slug}/mkoa/{slug}` | ~9,300 |
| Subject × school | `/somo/{slug}/shule/{slug}` | variable |
| Region hubs | `/mkoa/{slug}` | 31 |
| Region results | `/mkoa/{slug}/matokeo/{exam}/{year}` | ~1,395 |
| Region selections | `/mkoa/{slug}/uchaguzi/{year}` | ~155 |
| Council hubs | `/halmashauri/{slug}` | ~185 |
| Council results | `/halmashauri/{slug}/matokeo/{exam}/{year}` | ~8,325 |
| Council selections | `/halmashauri/{slug}/uchaguzi/{year}` | ~925 |
| Ward hubs | `/kata/{slug}` | ~3,000 |
| National results hubs | `/matokeo/{exam}/{year}` | ~45 |
| College profiles | `/chuo/{slug}` | ~300 |
| Course pages | `/kozi/{slug}` | ~2,000 |
| School filter pages | `/orodha/shule?...` | ~500+ |
| Exam explainers | `/mtihani/{slug}` | 9 |
| School comparison | `/linganisha/{slug}/vs/{slug}` | ~1,000+ |
| Oldest schools | `/orodha/shule-kongwe` | 1 |
| Selections national hub | `/uchaguzi/{year}` | ~5 |
| **Estimated total** | | **~500,000–2,000,000** |

---

## PART 11 — QUESTIONS EACH DIMENSION ANSWERS

This section exists so any team member can map a user question to the correct page without working through the architecture from scratch.

**Questions about a specific school:**
- What is this school and where is it? → School core profile
- How did this school perform in CSEE 2024? → School results page
- Where did this school's Form 4 students go in 2023? → School selections page, origin view
- Which combinations does this school's students typically receive? → School selections page, combination section
- Which colleges do students from this school attend? → School selections page, college section
- Where do students from this school's A-Level intake come from? → School selections page, destination view
- What subjects does this school teach? → School subjects page
- What combinations does this school offer? → School combinations page
- What trades does this school offer? → School trades page

**Questions about a combination:**
- What is PCM and what does it lead to? → Combination national page
- Which schools offer PCM in Mwanza? → Combination × region page
- Which O-Level schools produce the most PCM students nationally? → Combination national page, feeder section
- Is the female share of HGE growing? → Combination national page, gender section
- How many students received CBG in Arusha DC? → Combination × council page

**Questions about a location:**
- What schools exist in Dodoma region? → Region hub
- How did Dodoma schools perform in CSEE 2024? → Region results page
- How many students from Dodoma schools went to A-Level in 2023? → Region selections page
- What combinations are most common for students from Dodoma? → Region selections page, combination section
- Which council in Mwanza region has the most government secondary schools? → Region hub, council breakdown

**Questions about subjects:**
- Which schools in Tanzania are strongest in Mathematics? → Subject national page
- How has the national average GPA for Physics changed over five years? → Subject national page, trend section
- Which schools in Kilimanjaro teach Kiswahili? → Subject × region page

**Questions about colleges and courses:**
- Which colleges receive the most students from O-Level selections? → College hub
- How many students went to Butimba Teachers' College in 2024? → College profile
- Is the demand for Nursing courses growing? → Course page, trend section / Course trends page
- Which O-Level schools send the most students to nursing programmes? → Course page, feeder section

**Questions that have no answer elsewhere:**
- How far do students from schools in Lindi typically travel for A-Level? → Council/region selections page, geographic scope section
- Which primary schools produce the highest proportion of boarding secondary placements? → Aggregate of school selections pages (primary, boarding rate)
- Is a specific O-Level school improving its selections rate year on year? → School selections page, year comparison table
- Which combination is growing fastest nationally? → Course trends page equivalent for combinations / Combination national pages compared across years
- Which councils have the lowest A-Level selection rates? → Council hubs, aggregated selections data
- What is the female share of science combinations in each region? → Combination × region pages
