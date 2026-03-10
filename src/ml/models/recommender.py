"""
KerjaCerdas — Recommender Model
==================================
Collaborative filtering + content-based hybrid recommender for job suggestions.

Used by: matching_agent (secondary recommendations), API /api/v1/jobs endpoint
"""
from __future__ import annotations

import logging
from typing import Any

import numpy as np

logger = logging.getLogger(__name__)


class HybridRecommender:
    """
    Hybrid recommender combining content-based and collaborative signals.

    Content-based: skill overlap + regional affinity
    Collaborative: seeker behavior patterns (future: click, apply, save)

    This supplements the BERT matcher for cold-start scenarios
    where the model lacks training data for new jobs/seekers.
    """

    def __init__(self, content_weight: float = 0.7, collab_weight: float = 0.3) -> None:
        """
        Initialize hybrid recommender.

        Args:
            content_weight: Weight for content-based scoring.
            collab_weight: Weight for collaborative filtering scoring.
        """
        self.content_weight = content_weight
        self.collab_weight = collab_weight

        logger.info(
            f"HybridRecommender initialized: "
            f"content={content_weight}, collab={collab_weight}"
        )

    def score_content(
        self,
        seeker_skills: list[str],
        job_skills: list[str],
        seeker_region: str,
        job_region: str,
        region_weight: float = 0.3,
    ) -> float:
        """
        Content-based matching score.

        Args:
            seeker_skills: List of seeker's skills.
            job_skills: List of job's required skills.
            seeker_region: Seeker's BPS region code.
            job_region: Job's BPS region code.
            region_weight: Weight for regional match boost.

        Returns:
            Content score ∈ [0, 1].
        """
        if not job_skills:
            return 0.0

        seeker_set = {s.lower() for s in seeker_skills}
        job_set = {s.lower() for s in job_skills}

        skill_score = len(seeker_set & job_set) / len(job_set)
        region_bonus = region_weight if seeker_region == job_region else 0.0

        return min(1.0, skill_score + region_bonus)

    def recommend(
        self,
        seeker_profile: dict[str, Any],
        job_listings: list[dict[str, Any]],
        top_k: int = 10,
    ) -> list[dict[str, Any]]:
        """
        Generate job recommendations for a seeker.

        Args:
            seeker_profile: Dict with skills, region, experience, etc.
            job_listings: List of available job posting dicts.
            top_k: Number of top recommendations.

        Returns:
            List of job dicts with added recommendation_score.
        """
        scored_jobs = []
        for job in job_listings:
            content_score = self.score_content(
                seeker_skills=seeker_profile.get("skills", []),
                job_skills=job.get("required_skills", []),
                seeker_region=seeker_profile.get("region_code", ""),
                job_region=job.get("region_code", ""),
            )
            # Collaborative score placeholder (production: from user behavior data)
            collab_score = 0.5

            final_score = (
                self.content_weight * content_score
                + self.collab_weight * collab_score
            )

            scored_jobs.append({
                **job,
                "recommendation_score": round(final_score, 4),
            })

        scored_jobs.sort(key=lambda x: x["recommendation_score"], reverse=True)
        return scored_jobs[:top_k]
