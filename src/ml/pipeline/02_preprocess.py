"""
KerjaCerdas ML Pipeline — Phase 2: Preprocessing
====================================================
Normalizes, cleans, and standardizes raw data from Phase 1.

Input:  raw/jobs_{date}.parquet, raw/seekers_{date}.parquet
Output: processed/jobs_clean.parquet, processed/seekers_clean.parquet

ANTIGRAVITY PROTOCOL §5: PHASE 2 | PII removal | KBJI standardization
"""
from __future__ import annotations

import logging
import re
from pathlib import Path

import pandas as pd

logger = logging.getLogger(__name__)

RAW_DIR = Path("data/raw")
PROCESSED_DIR = Path("data/processed")


def normalize_text(text: str) -> str:
    """
    Normalize Indonesian text for NLP processing.

    Steps:
    1. Lowercase
    2. Strip HTML tags
    3. Normalize whitespace
    4. Handle Bahasa Indonesia + Javanese/Sundanese terms

    Args:
        text: Raw text input.

    Returns:
        Cleaned and normalized text.
    """
    if not isinstance(text, str):
        return ""

    text = text.lower()
    text = re.sub(r"<[^>]+>", "", text)  # Strip HTML
    text = re.sub(r"\s+", " ", text).strip()  # Normalize whitespace

    return text


def standardize_job_title(title: str) -> str:
    """
    Map job titles to standardized BPS KBJI occupation codes.

    Args:
        title: Raw job title.

    Returns:
        Standardized title aligned with KBJI taxonomy.
    """
    # Mapping of common variants to standard titles
    title_map = {
        "data analyst": "Analis Data",
        "ml engineer": "Machine Learning Engineer",
        "machine learning engineer": "Machine Learning Engineer",
        "backend engineer": "Software Engineer - Backend",
        "backend developer": "Software Engineer - Backend",
        "data engineer": "Data Engineer",
        "bi analyst": "Business Intelligence Analyst",
        "business intelligence analyst": "Business Intelligence Analyst",
        "data scientist": "Data Scientist",
    }
    return title_map.get(title.lower().strip(), title)


def remove_pii(df: pd.DataFrame, pii_columns: list[str] | None = None) -> pd.DataFrame:
    """
    Remove personally identifiable information from seeker data.

    Args:
        df: DataFrame containing seeker profiles.
        pii_columns: Columns to anonymize. Defaults to common PII fields.

    Returns:
        DataFrame with PII removed/anonymized.
    """
    pii_columns = pii_columns or ["phone", "email", "address", "nik"]
    for col in pii_columns:
        if col in df.columns:
            df = df.drop(columns=[col])
            logger.info(f"Removed PII column: {col}")

    return df


def preprocess_jobs(input_path: Path | None = None) -> pd.DataFrame:
    """
    Preprocess raw job postings data.

    Args:
        input_path: Path to raw parquet file. If None, finds latest.

    Returns:
        Cleaned DataFrame saved to processed directory.
    """
    PROCESSED_DIR.mkdir(parents=True, exist_ok=True)

    if input_path is None:
        parquets = sorted(RAW_DIR.glob("jobs_*.parquet"))
        if not parquets:
            raise FileNotFoundError(f"No job files found in {RAW_DIR}")
        input_path = parquets[-1]

    logger.info(f"Preprocessing jobs from {input_path}")
    df = pd.read_parquet(input_path)

    # Normalize text columns
    for col in ["title", "description"]:
        if col in df.columns:
            df[col] = df[col].apply(normalize_text)

    # Standardize titles
    if "title" in df.columns:
        df["title_standardized"] = df["title"].apply(standardize_job_title)

    output_path = PROCESSED_DIR / "jobs_clean.parquet"
    df.to_parquet(output_path, index=False)
    logger.info(f"Saved {len(df)} preprocessed jobs to {output_path}")

    return df


def preprocess_seekers(input_path: Path | None = None) -> pd.DataFrame:
    """
    Preprocess raw seeker profiles with PII removal.

    Args:
        input_path: Path to raw parquet file. If None, finds latest.

    Returns:
        Cleaned DataFrame saved to processed directory.
    """
    PROCESSED_DIR.mkdir(parents=True, exist_ok=True)

    if input_path is None:
        parquets = sorted(RAW_DIR.glob("seekers_*.parquet"))
        if not parquets:
            raise FileNotFoundError(f"No seeker files found in {RAW_DIR}")
        input_path = parquets[-1]

    logger.info(f"Preprocessing seekers from {input_path}")
    df = pd.read_parquet(input_path)

    # Remove PII
    df = remove_pii(df)

    output_path = PROCESSED_DIR / "seekers_clean.parquet"
    df.to_parquet(output_path, index=False)
    logger.info(f"Saved {len(df)} preprocessed seekers to {output_path}")

    return df


if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    preprocess_jobs()
    preprocess_seekers()
