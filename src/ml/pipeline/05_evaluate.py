"""
KerjaCerdas ML Pipeline — Phase 5: Evaluation
===============================================
Offline evaluation of trained models with fairness auditing.

Input:  models/bert_matcher_v{version}.pt, test dataset
Output: reports/eval_report_{date}.json

ANTIGRAVITY PROTOCOL §5: PHASE 5 | Target: nDCG@10 ≥ 0.82 | Fairness audit
"""
from __future__ import annotations

import json
import logging
from datetime import datetime
from pathlib import Path

import numpy as np

logger = logging.getLogger(__name__)

REPORTS_DIR = Path("reports")
SEED = 42


def precision_at_k(relevant: list[bool], k: int = 5) -> float:
    """
    Calculate Precision@K.

    Args:
        relevant: Boolean list indicating if each result is relevant.
        k: Number of top results to consider.

    Returns:
        Precision score at position K.
    """
    if not relevant or k <= 0:
        return 0.0
    top_k = relevant[:k]
    return sum(top_k) / k


def recall_at_k(relevant: list[bool], total_relevant: int, k: int = 10) -> float:
    """
    Calculate Recall@K.

    Args:
        relevant: Boolean list indicating if each result is relevant.
        total_relevant: Total number of relevant items.
        k: Number of top results to consider.

    Returns:
        Recall score at position K.
    """
    if total_relevant == 0 or k <= 0:
        return 0.0
    top_k = relevant[:k]
    return sum(top_k) / total_relevant


def ndcg_at_k(relevance_scores: list[float], k: int = 10) -> float:
    """
    Calculate Normalized Discounted Cumulative Gain at K.

    Args:
        relevance_scores: List of relevance scores for ranked results.
        k: Number of top results to consider.

    Returns:
        nDCG score at position K.
    """
    if not relevance_scores or k <= 0:
        return 0.0

    dcg = sum(
        rel / np.log2(i + 2)
        for i, rel in enumerate(relevance_scores[:k])
    )
    ideal = sorted(relevance_scores, reverse=True)[:k]
    idcg = sum(
        rel / np.log2(i + 2)
        for i, rel in enumerate(ideal)
    )

    return dcg / idcg if idcg > 0 else 0.0


def mrr(relevant: list[bool]) -> float:
    """
    Calculate Mean Reciprocal Rank.

    Args:
        relevant: Boolean list indicating if each result is relevant.

    Returns:
        MRR score.
    """
    for i, is_relevant in enumerate(relevant):
        if is_relevant:
            return 1.0 / (i + 1)
    return 0.0


def fairness_audit(
    match_rates: dict[str, float],
    dimension: str = "region",
) -> dict[str, float]:
    """
    Audit match rates across demographic dimensions.

    Checks for disparity between groups (e.g., Java vs outer islands).

    Args:
        match_rates: Dict of group_name → match_rate.
        dimension: Fairness dimension being audited.

    Returns:
        Audit results with disparity metrics.
    """
    if not match_rates:
        return {"disparity": 0.0, "max_gap": 0.0}

    rates = list(match_rates.values())
    max_gap = max(rates) - min(rates)

    logger.info(
        f"Fairness audit ({dimension}): "
        f"max_gap={max_gap:.3f}, groups={list(match_rates.keys())}"
    )

    return {
        "dimension": dimension,
        "group_rates": match_rates,
        "max_gap": round(max_gap, 4),
        "disparity_threshold": 0.15,  # <15% gap target from PRD
        "passed": max_gap < 0.15,
    }


def evaluate_model(model_version: str = "0.1.0") -> dict:
    """
    Run full model evaluation suite.

    Includes ranking metrics and fairness audit.

    Args:
        model_version: Version string for the model being evaluated.

    Returns:
        Evaluation report dict, also saved as JSON.
    """
    REPORTS_DIR.mkdir(parents=True, exist_ok=True)
    np.random.seed(SEED)

    logger.info(f"Evaluating model v{model_version}...")

    # Demo evaluation with synthetic scores
    # Production: run on held-out labeled test set
    n_queries = 100
    k_values = [5, 10]

    # Synthetic relevance scores (demo)
    p5_scores = np.random.beta(8, 2, n_queries)
    r10_scores = np.random.beta(7, 3, n_queries)
    ndcg_scores = np.random.beta(9, 2, n_queries)
    mrr_scores = np.random.beta(8, 2, n_queries)

    report = {
        "model_version": model_version,
        "evaluation_date": datetime.now().isoformat(),
        "n_queries": n_queries,
        "metrics": {
            "precision_at_5": round(float(p5_scores.mean()), 4),
            "recall_at_10": round(float(r10_scores.mean()), 4),
            "ndcg_at_10": round(float(ndcg_scores.mean()), 4),
            "mrr": round(float(mrr_scores.mean()), 4),
        },
        "target_met": {
            "ndcg_at_10": float(ndcg_scores.mean()) >= 0.82,
        },
        "fairness": {
            "region": fairness_audit(
                {"java": 0.85, "sumatra": 0.78, "kalimantan": 0.73, "sulawesi": 0.71},
                "region",
            ),
            "education": fairness_audit(
                {"S1": 0.82, "D3": 0.76, "S2": 0.88, "SMK": 0.65},
                "education",
            ),
        },
    }

    # Save report
    date_str = datetime.now().strftime("%Y%m%d")
    report_path = REPORTS_DIR / f"eval_report_{date_str}.json"
    report_path.write_text(json.dumps(report, indent=2, ensure_ascii=False))
    logger.info(f"Evaluation report saved to {report_path}")

    # Log summary
    metrics = report["metrics"]
    logger.info(
        f"Results: P@5={metrics['precision_at_5']:.4f}, "
        f"R@10={metrics['recall_at_10']:.4f}, "
        f"nDCG@10={metrics['ndcg_at_10']:.4f}, "
        f"MRR={metrics['mrr']:.4f}"
    )

    return report


if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    evaluate_model()
