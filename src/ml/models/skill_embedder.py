"""
KerjaCerdas — Skill Embedder
==============================
Embeds skill descriptions into dense vectors for skill matching and clustering.

Used by: matching_agent (skill similarity), skill_gap_agent (course mapping)
Config: config/ml_config.yaml (embedding_dim: 768)
"""
from __future__ import annotations

import logging
from typing import Any

import numpy as np

logger = logging.getLogger(__name__)


class SkillEmbedder:
    """
    Embeds skill names/descriptions into dense vectors.

    Uses sentence-transformers under the hood for production.
    In demo mode: uses a simple hash-based pseudo-embedding.
    """

    def __init__(self, model_name: str = "all-MiniLM-L6-v2", demo_mode: bool = True) -> None:
        """
        Initialize skill embedder.

        Args:
            model_name: Sentence-transformers model name.
            demo_mode: If True, use hash-based embeddings.
        """
        self.model_name = model_name
        self.demo_mode = demo_mode
        self._model: Any = None

        if not demo_mode:
            # Production: load sentence-transformers model
            pass

        logger.info(f"SkillEmbedder initialized (demo_mode={demo_mode})")

    def embed(self, skills: list[str], dim: int = 768) -> np.ndarray:
        """
        Embed a list of skill names into dense vectors.

        Args:
            skills: List of skill names.
            dim: Embedding dimension.

        Returns:
            Numpy array of shape (n_skills, dim).
        """
        if self.demo_mode:
            return self._hash_embed(skills, dim)

        # Production: use sentence-transformers
        raise NotImplementedError("Production embedding requires model loading")

    def _hash_embed(self, skills: list[str], dim: int) -> np.ndarray:
        """Generate deterministic pseudo-embeddings from skill names."""
        embeddings = np.zeros((len(skills), dim), dtype=np.float32)
        for i, skill in enumerate(skills):
            np.random.seed(hash(skill.lower()) % (2**31))
            embeddings[i] = np.random.randn(dim).astype(np.float32)
            embeddings[i] /= np.linalg.norm(embeddings[i])
        return embeddings

    def similarity(self, skill_a: str, skill_b: str) -> float:
        """
        Compute cosine similarity between two skills.

        Args:
            skill_a: First skill name.
            skill_b: Second skill name.

        Returns:
            Cosine similarity score ∈ [-1, 1].
        """
        emb = self.embed([skill_a, skill_b])
        return float(np.dot(emb[0], emb[1]))
