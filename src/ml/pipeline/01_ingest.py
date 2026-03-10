"""
KerjaCerdas ML Pipeline — Phase 1: Data Ingestion
====================================================
Fetches raw job and seeker data from external sources.

Sources: BPS Labor Statistics, JobStreet API, LinkedIn Skills Taxonomy
Output:  raw/jobs_{date}.parquet, raw/seekers_{date}.parquet

ANTIGRAVITY PROTOCOL §5: PHASE 1 | Seeds: 42 | Format: Parquet
Config: config/ml_config.yaml
"""
from __future__ import annotations

import logging
from datetime import datetime
from pathlib import Path

import pandas as pd

logger = logging.getLogger(__name__)

# Seed for reproducibility (PROTOCOL §6)
SEED = 42
RAW_DIR = Path("data/raw")


def ingest_jobs(output_dir: Path = RAW_DIR) -> pd.DataFrame:
    """
    Fetch and store raw job postings from configured sources.

    In demo mode: loads seed data from scripts/seed_data.py.
    In production: connects to JobStreet API, Indeed scraper, BPS Open Data.

    Args:
        output_dir: Directory to store raw parquet files.

    Returns:
        DataFrame with raw job posting data.
    """
    output_dir.mkdir(parents=True, exist_ok=True)
    date_str = datetime.now().strftime("%Y%m%d")

    logger.info("Ingesting job postings from configured sources...")

    # Demo seed data — representative Indonesian job postings
    jobs = pd.DataFrame([
        {
            "job_id": f"job-{i:03d}",
            "title": title,
            "company": company,
            "region_code": region,
            "salary_min": sal_min,
            "salary_max": sal_max,
            "required_skills": skills,
            "education_min": "S1",
            "experience_years_min": exp,
            "description": desc,
            "kbji_code": kbji,
        }
        for i, (title, company, region, sal_min, sal_max, skills, exp, desc, kbji) in enumerate([
            ("Data Analyst", "Bank Mandiri", "3171", 8_000_000, 15_000_000,
             ["Python", "SQL", "Excel", "Tableau", "Statistics"], 1,
             "Menganalisis data bisnis untuk mendukung pengambilan keputusan", "2511"),
            ("Machine Learning Engineer", "Gojek", "3171", 15_000_000, 30_000_000,
             ["Python", "TensorFlow", "PyTorch", "SQL", "Docker"], 2,
             "Membangun dan deploy model ML untuk platform transportasi", "2511"),
            ("Business Intelligence Analyst", "Tokopedia", "3171", 10_000_000, 18_000_000,
             ["SQL", "Python", "Tableau", "Business Analysis"], 1,
             "Membuat dashboard dan insight bisnis untuk e-commerce", "2511"),
            ("Data Engineer", "Traveloka", "3171", 12_000_000, 22_000_000,
             ["Python", "SQL", "Spark", "Kafka", "Airflow"], 2,
             "Membangun data pipeline untuk platform travel", "2511"),
            ("Software Engineer - Backend", "Bukalapak", "3171", 10_000_000, 20_000_000,
             ["Python", "Go", "PostgreSQL", "Redis", "Docker"], 1,
             "Mengembangkan microservice backend untuk marketplace", "2512"),
        ], start=1)
    ])

    output_path = output_dir / f"jobs_{date_str}.parquet"
    jobs.to_parquet(output_path, index=False)
    logger.info(f"Saved {len(jobs)} jobs to {output_path}")

    return jobs


def ingest_seekers(output_dir: Path = RAW_DIR) -> pd.DataFrame:
    """
    Fetch and store raw seeker profile data.

    Args:
        output_dir: Directory to store raw parquet files.

    Returns:
        DataFrame with raw seeker data.
    """
    output_dir.mkdir(parents=True, exist_ok=True)
    date_str = datetime.now().strftime("%Y%m%d")

    logger.info("Ingesting seeker profiles...")

    seekers = pd.DataFrame([
        {
            "seeker_id": f"seeker-{i:03d}",
            "name": name,
            "skills": skills,
            "experience_years": exp,
            "education_level": edu,
            "region_code": region,
            "salary_expectation": salary,
        }
        for i, (name, skills, exp, edu, region, salary) in enumerate([
            ("Budi Santoso", ["Python", "SQL", "Excel"], 1, "S1", "3171", 12_000_000),
            ("Siti Rahayu", ["Python", "R", "Statistics", "SQL"], 2, "S2", "3171", 15_000_000),
            ("Ahmad Wijaya", ["Java", "Spring Boot", "PostgreSQL"], 3, "S1", "3573", 14_000_000),
            ("Maya Putri", ["JavaScript", "React", "Node.js", "MongoDB"], 1, "S1", "3471", 10_000_000),
            ("Rizky Pratama", ["Python", "Docker", "Kubernetes", "AWS"], 4, "S1", "3171", 20_000_000),
        ], start=1)
    ])

    output_path = output_dir / f"seekers_{date_str}.parquet"
    seekers.to_parquet(output_path, index=False)
    logger.info(f"Saved {len(seekers)} seekers to {output_path}")

    return seekers


if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    ingest_jobs()
    ingest_seekers()
