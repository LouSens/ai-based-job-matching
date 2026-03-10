"""
KerjaCerdas — Seed Data Script
================================
Populates the database with demo job postings and seeker profiles
for hackathon demonstration.

Usage: python scripts/seed_data.py

ANTIGRAVITY PROTOCOL: Referenced by 01_ingest.py, DEMO_SCRIPT.md
"""
from __future__ import annotations

import json
import logging
from pathlib import Path

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


# ─── Demo Job Postings ───────────────────────────────────────────────────────

SEED_JOBS = [
    {
        "job_id": "job-001",
        "title": "Data Analyst",
        "company": "Bank Mandiri",
        "region_code": "3171",
        "region_name": "Jakarta Pusat",
        "salary_min": 8_000_000,
        "salary_max": 15_000_000,
        "required_skills": ["Python", "SQL", "Excel", "Tableau", "Statistics"],
        "education_min": "S1",
        "experience_years_min": 1,
        "description": "Menganalisis data bisnis perbankan untuk mendukung pengambilan keputusan strategis.",
        "kbji_code": "2511",
    },
    {
        "job_id": "job-002",
        "title": "Machine Learning Engineer",
        "company": "Gojek",
        "region_code": "3171",
        "region_name": "Jakarta Selatan",
        "salary_min": 15_000_000,
        "salary_max": 30_000_000,
        "required_skills": ["Python", "TensorFlow", "PyTorch", "SQL", "Docker"],
        "education_min": "S1",
        "experience_years_min": 2,
        "description": "Membangun dan deploy model ML untuk optimasi platform transportasi online.",
        "kbji_code": "2511",
    },
    {
        "job_id": "job-003",
        "title": "Business Intelligence Analyst",
        "company": "Tokopedia",
        "region_code": "3171",
        "region_name": "Jakarta Barat",
        "salary_min": 10_000_000,
        "salary_max": 18_000_000,
        "required_skills": ["SQL", "Python", "Tableau", "Business Analysis"],
        "education_min": "S1",
        "experience_years_min": 1,
        "description": "Membuat dashboard dan insight bisnis untuk operasional e-commerce.",
        "kbji_code": "2511",
    },
    {
        "job_id": "job-004",
        "title": "Data Engineer",
        "company": "Traveloka",
        "region_code": "3171",
        "region_name": "Jakarta Selatan",
        "salary_min": 12_000_000,
        "salary_max": 22_000_000,
        "required_skills": ["Python", "SQL", "Spark", "Kafka", "Airflow"],
        "education_min": "S1",
        "experience_years_min": 2,
        "description": "Membangun data pipeline yang scalable untuk platform travel terbesar di Asia Tenggara.",
        "kbji_code": "2511",
    },
    {
        "job_id": "job-005",
        "title": "Software Engineer - Backend",
        "company": "Bukalapak",
        "region_code": "3171",
        "region_name": "Jakarta Selatan",
        "salary_min": 10_000_000,
        "salary_max": 20_000_000,
        "required_skills": ["Python", "Go", "PostgreSQL", "Redis", "Docker"],
        "education_min": "S1",
        "experience_years_min": 1,
        "description": "Mengembangkan microservice backend untuk marketplace dengan jutaan pengguna.",
        "kbji_code": "2512",
    },
]

# ─── Demo Seeker Profiles ────────────────────────────────────────────────────

SEED_SEEKERS = [
    {
        "seeker_id": "seeker-001",
        "name": "Budi Santoso",
        "skills": ["Python", "SQL", "Excel"],
        "experience_years": 1,
        "education_level": "S1",
        "region_code": "3171",
        "salary_expectation": 12_000_000,
    },
    {
        "seeker_id": "seeker-002",
        "name": "Siti Rahayu",
        "skills": ["Python", "R", "Statistics", "SQL"],
        "experience_years": 2,
        "education_level": "S2",
        "region_code": "3171",
        "salary_expectation": 15_000_000,
    },
    {
        "seeker_id": "seeker-003",
        "name": "Ahmad Wijaya",
        "skills": ["Java", "Spring Boot", "PostgreSQL"],
        "experience_years": 3,
        "education_level": "S1",
        "region_code": "3573",
        "salary_expectation": 14_000_000,
    },
]


def seed_database() -> None:
    """
    Seed the database with demo data.

    In demo mode: saves to JSON files.
    In production: inserts into PostgreSQL via SQLAlchemy.
    """
    data_dir = Path("data/seed")
    data_dir.mkdir(parents=True, exist_ok=True)

    # Write seed data
    jobs_path = data_dir / "seed_jobs.json"
    jobs_path.write_text(json.dumps(SEED_JOBS, indent=2, ensure_ascii=False))
    logger.info(f"Seeded {len(SEED_JOBS)} jobs to {jobs_path}")

    seekers_path = data_dir / "seed_seekers.json"
    seekers_path.write_text(json.dumps(SEED_SEEKERS, indent=2, ensure_ascii=False))
    logger.info(f"Seeded {len(SEED_SEEKERS)} seekers to {seekers_path}")


if __name__ == "__main__":
    seed_database()
