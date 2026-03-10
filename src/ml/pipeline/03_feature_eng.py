"""
KerjaCerdas ML Pipeline — Phase 3: Feature Engineering
========================================================
Generates feature vectors from preprocessed data for model training.

Input:  processed/jobs_clean.parquet, processed/seekers_clean.parquet
Output: features/feature_matrix.npz + feature_store/

ANTIGRAVITY PROTOCOL §5: PHASE 3 | BERT 768-dim | Regional features
"""
from __future__ import annotations

import logging
from pathlib import Path

import numpy as np
import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer

logger = logging.getLogger(__name__)

PROCESSED_DIR = Path("data/processed")
FEATURE_DIR = Path("data/features")
SEED = 42


def compute_tfidf_features(texts: list[str], max_features: int = 5000) -> np.ndarray:
    """
    Compute TF-IDF sparse features from job descriptions.

    Args:
        texts: List of preprocessed text strings.
        max_features: Maximum vocabulary size.

    Returns:
        TF-IDF feature matrix as numpy array.
    """
    vectorizer = TfidfVectorizer(
        max_features=max_features,
        ngram_range=(1, 2),
        stop_words=None,  # Indonesian stopwords handled in preprocessing
    )
    tfidf_matrix = vectorizer.fit_transform(texts)
    logger.info(f"TF-IDF features: shape={tfidf_matrix.shape}")
    return tfidf_matrix.toarray()


def compute_skill_features(skills_lists: list[list[str]], all_skills: list[str]) -> np.ndarray:
    """
    Compute binary skill feature vectors.

    Args:
        skills_lists: List of skill lists per record.
        all_skills: Master list of all possible skills.

    Returns:
        Binary feature matrix of shape (n_records, n_skills).
    """
    skill_idx = {skill.lower(): i for i, skill in enumerate(all_skills)}
    n_records = len(skills_lists)
    n_skills = len(all_skills)

    features = np.zeros((n_records, n_skills), dtype=np.float32)
    for i, skills in enumerate(skills_lists):
        for skill in skills:
            idx = skill_idx.get(skill.lower())
            if idx is not None:
                features[i, idx] = 1.0

    logger.info(f"Skill features: shape={features.shape}")
    return features


def compute_regional_features(region_codes: list[str]) -> np.ndarray:
    """
    Compute regional labor demand index features.

    Uses BPS regional data to weight job opportunities by kabupaten/kota.

    Args:
        region_codes: List of BPS region codes.

    Returns:
        Regional feature vectors.
    """
    # Labor demand index per region (demo values from BPS data)
    demand_index = {
        "3171": 0.95,  # Jakarta Pusat - highest demand
        "3172": 0.88,  # Jakarta Utara
        "3173": 0.85,  # Jakarta Barat
        "3174": 0.90,  # Jakarta Selatan
        "3175": 0.82,  # Jakarta Timur
        "3573": 0.65,  # Malang
        "3471": 0.60,  # Yogyakarta
        "3578": 0.72,  # Surabaya
        "1271": 0.55,  # Medan
        "7371": 0.50,  # Makassar
    }

    features = np.array(
        [[demand_index.get(rc, 0.40)] for rc in region_codes],
        dtype=np.float32,
    )
    logger.info(f"Regional features: shape={features.shape}")
    return features


def engineer_features() -> dict[str, np.ndarray]:
    """
    Main feature engineering pipeline.

    Combines:
    - TF-IDF text features from job descriptions
    - Binary skill vector features
    - Regional labor demand index

    Returns:
        Dictionary of feature matrices saved to disk.
    """
    np.random.seed(SEED)
    FEATURE_DIR.mkdir(parents=True, exist_ok=True)

    # Load preprocessed data
    jobs_df = pd.read_parquet(PROCESSED_DIR / "jobs_clean.parquet")
    logger.info(f"Loaded {len(jobs_df)} preprocessed jobs")

    # Extract all unique skills
    all_skills = sorted(set(
        skill for skills in jobs_df["required_skills"] for skill in skills
    ))
    logger.info(f"Unique skills found: {len(all_skills)}")

    # Compute features
    feature_sets = {}

    if "description" in jobs_df.columns:
        feature_sets["tfidf"] = compute_tfidf_features(
            jobs_df["description"].fillna("").tolist()
        )

    feature_sets["skills"] = compute_skill_features(
        jobs_df["required_skills"].tolist(),
        all_skills,
    )

    feature_sets["regional"] = compute_regional_features(
        jobs_df["region_code"].tolist()
    )

    # Save combined feature matrix
    output_path = FEATURE_DIR / "feature_matrix.npz"
    np.savez_compressed(output_path, **feature_sets)
    logger.info(f"Saved feature matrices to {output_path}")

    # Save skill vocabulary
    vocab_path = FEATURE_DIR / "skill_vocabulary.txt"
    vocab_path.write_text("\n".join(all_skills))
    logger.info(f"Saved skill vocabulary ({len(all_skills)} skills) to {vocab_path}")

    return feature_sets


if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    engineer_features()
