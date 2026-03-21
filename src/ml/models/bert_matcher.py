"""
KerjaCerdas — BERT Matcher Model
==================================
IndoBERT-based bi-encoder for job-seeker semantic matching.

Architecture: Dual-tower bi-encoder with shared IndoBERT backbone.
Reference: config/ml_config.yaml for hyperparameters.

ANTIGRAVITY PROTOCOL §5: Base model = indobert-base-uncased, 768-dim embeddings
"""
from __future__ import annotations

import logging
from typing import Any

import torch
import torch.nn as nn

logger = logging.getLogger(__name__)


class BERTMatcher(nn.Module):
    """
    Bi-encoder model for job-seeker matching.

    Architecture:
    - Tower A: Encodes job posting (title + description + skills)
    - Tower B: Encodes seeker profile (skills + experience + education)
    - Both towers share an IndoBERT backbone
    - Output: cosine similarity score ∈ [0, 1]

    Training:
    - Contrastive loss with in-batch negatives
    - Hard negative mining for challenging pairs
    """

    def __init__(
        self,
        model_name: str = "indobert-base-uncased",
        embedding_dim: int = 768,
        dropout: float = 0.1,
    ) -> None:
        """
        Initialize BERT matcher.

        Args:
            model_name: HuggingFace model name for backbone.
            embedding_dim: Dimension of output embeddings.
            dropout: Dropout rate for regularization.
        """
        super().__init__()
        self.model_name = model_name
        self.embedding_dim = embedding_dim

        # Projection head: BERT output → normalized embedding
        self.projection = nn.Sequential(
            nn.Linear(embedding_dim, embedding_dim),
            nn.ReLU(),
            nn.Dropout(dropout),
            nn.Linear(embedding_dim, embedding_dim),
        )

        logger.info(
            f"BERTMatcher initialized: model={model_name}, "
            f"dim={embedding_dim}, dropout={dropout}"
        )

    def encode(self, input_ids: torch.Tensor, attention_mask: torch.Tensor) -> torch.Tensor:
        """
        Encode input text into normalized embedding vector.

        Args:
            input_ids: Tokenized input IDs.
            attention_mask: Attention mask tensor.

        Returns:
            L2-normalized embedding tensor of shape (batch, embedding_dim).
        """
        # Placeholder: In production, pass through IndoBERT backbone
        batch_size = input_ids.shape[0]
        dummy_output = torch.randn(batch_size, self.embedding_dim)

        projected = self.projection(dummy_output)
        normalized = nn.functional.normalize(projected, p=2, dim=1)

        return normalized

    def forward(
        self,
        job_input_ids: torch.Tensor,
        job_attention_mask: torch.Tensor,
        seeker_input_ids: torch.Tensor,
        seeker_attention_mask: torch.Tensor,
    ) -> torch.Tensor:
        """
        Compute matching scores between job and seeker batches.

        Args:
            job_input_ids: Tokenized job posting inputs.
            job_attention_mask: Job attention masks.
            seeker_input_ids: Tokenized seeker profile inputs.
            seeker_attention_mask: Seeker attention masks.

        Returns:
            Cosine similarity scores of shape (batch,).
        """
        job_emb = self.encode(job_input_ids, job_attention_mask)
        seeker_emb = self.encode(seeker_input_ids, seeker_attention_mask)

        # Cosine similarity (embeddings already normalized)
        scores = (job_emb * seeker_emb).sum(dim=1)

        return scores

    def save(self, path: str) -> None:
        """Save model checkpoint."""
        torch.save(self.state_dict(), path)
        logger.info(f"Model saved to {path}")

    def load(self, path: str) -> None:
        """Load model checkpoint."""
        checkpoint = torch.load(path, map_location="cpu", weights_only=True)

        if isinstance(checkpoint, dict):
            state_dict = checkpoint.get("state_dict") or checkpoint.get("model_state")
        else:
            state_dict = checkpoint

        if not isinstance(state_dict, dict) or not state_dict:
            raise ValueError(f"Checkpoint at {path} does not contain a valid state_dict")

        self.load_state_dict(state_dict)
        logger.info(f"Model loaded from {path}")
