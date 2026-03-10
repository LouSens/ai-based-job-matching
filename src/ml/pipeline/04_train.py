"""
KerjaCerdas ML Pipeline — Phase 4: Model Training
====================================================
Fine-tunes IndoBERT for job-skill matching using bi-encoder + cross-encoder.

Input:  features/feature_matrix.npz, processed/jobs_clean.parquet
Output: models/bert_matcher_v{version}.pt

ANTIGRAVITY PROTOCOL §5: PHASE 4 | Seeds: 42 | Tracking: MLflow
Config: config/ml_config.yaml
"""
from __future__ import annotations

import logging
import random
from pathlib import Path

import numpy as np
import torch

logger = logging.getLogger(__name__)

# Reproducibility seeds per PROTOCOL §6
SEED = 42
random.seed(SEED)
np.random.seed(SEED)
torch.manual_seed(SEED)

FEATURE_DIR = Path("data/features")
MODEL_DIR = Path("models")


def train_bi_encoder(
    feature_path: Path = FEATURE_DIR / "feature_matrix.npz",
    model_name: str = "indobert-base-uncased",
    epochs: int = 10,
    batch_size: int = 32,
    learning_rate: float = 2e-5,
) -> Path:
    """
    Train bi-encoder for fast job-seeker retrieval.

    Architecture:
    - Dual tower: separate encoders for jobs and seekers
    - Shared IndoBERT backbone, fine-tuned
    - Cosine similarity for matching score
    - Trained with contrastive loss

    Args:
        feature_path: Path to feature matrix from Phase 3.
        model_name: HuggingFace model identifier.
        epochs: Training epochs.
        batch_size: Training batch size.
        learning_rate: Learning rate for AdamW optimizer.

    Returns:
        Path to saved model checkpoint.
    """
    MODEL_DIR.mkdir(parents=True, exist_ok=True)

    logger.info(f"Loading features from {feature_path}")
    features = np.load(feature_path)

    logger.info(
        f"Training bi-encoder: model={model_name}, "
        f"epochs={epochs}, batch_size={batch_size}, lr={learning_rate}"
    )

    # TODO: Week 1 implementation
    # 1. Load IndoBERT from HuggingFace
    # 2. Create dual-tower bi-encoder architecture
    # 3. Prepare training pairs (positive & hard negatives)
    # 4. Train with contrastive loss
    # 5. Log metrics to MLflow (RULE-03)
    # 6. Save checkpoint

    model_path = MODEL_DIR / "bert_matcher_v0.1.pt"

    # Placeholder - save dummy model for demo
    torch.save({"model_state": {}, "version": "0.1.0", "seed": SEED}, model_path)
    logger.info(f"Model checkpoint saved to {model_path}")

    return model_path


def train_cross_encoder(
    model_name: str = "indobert-base-uncased",
    epochs: int = 5,
    batch_size: int = 16,
    learning_rate: float = 1e-5,
    top_n: int = 50,
) -> Path:
    """
    Train cross-encoder for reranking top-N candidates.

    Architecture:
    - Single tower: concatenated [job; SEP; seeker] input
    - Binary classification: relevant / not relevant
    - Applied to top-50 bi-encoder results for precision

    Args:
        model_name: HuggingFace model identifier.
        epochs: Training epochs.
        batch_size: Training batch size.
        learning_rate: Learning rate.
        top_n: Number of candidates to rerank.

    Returns:
        Path to saved reranker model.
    """
    MODEL_DIR.mkdir(parents=True, exist_ok=True)

    logger.info(
        f"Training cross-encoder reranker: top_{top_n}, "
        f"epochs={epochs}, batch_size={batch_size}"
    )

    # TODO: Week 1 implementation
    # 1. Load bi-encoder candidates
    # 2. Create paired inputs [job_text; SEP; seeker_text]
    # 3. Train with cross-entropy loss
    # 4. Log to MLflow

    model_path = MODEL_DIR / "cross_encoder_v0.1.pt"
    torch.save({"model_state": {}, "version": "0.1.0", "seed": SEED}, model_path)
    logger.info(f"Cross-encoder saved to {model_path}")

    return model_path


if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    logger.info("Starting model training pipeline...")
    bi_path = train_bi_encoder()
    cross_path = train_cross_encoder()
    logger.info(f"Training complete. Bi-encoder: {bi_path}, Cross-encoder: {cross_path}")
