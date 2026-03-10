"""
KerjaCerdas — Matching Agent
==============================
Job-skill matching core using BERT bi-encoder + cross-encoder reranking.
In demo mode: returns mock scored results with realistic explanations.

ANTIGRAVITY PROTOCOL: matching_agent | Model: IndoBERT fine-tuned | Latency SLA: <200ms
"""
from __future__ import annotations

import logging
import time
import uuid
from dataclasses import dataclass, field
from typing import Any

logger = logging.getLogger(__name__)


@dataclass
class MatchCandidate:
    """A single job-seeker match result."""

    job_id: str
    title: str
    company: str
    match_score: float
    skill_overlap: float
    region_match: bool
    salary_in_range: bool
    explanation: str


@dataclass
class MatchingRequest:
    """Input for matching agent execution."""

    request_id: str = field(default_factory=lambda: str(uuid.uuid4()))
    seeker_skills: list[str] = field(default_factory=list)
    seeker_experience_years: int = 0
    seeker_region: str = ""
    salary_expectation: int = 0
    top_k: int = 10
    region_filter: str | None = None


class MatchingAgent:
    """
    BERT-based job-skill matching agent.

    Pipeline:
    1. Encode seeker profile → 768-dim embedding (IndoBERT bi-encoder)
    2. Retrieve top-K jobs via cosine similarity (fast)
    3. Rerank top-50 with cross-encoder for precision
    4. Return scored results with explanations

    In demo mode (default): returns mock data with realistic scoring.
    """

    CONFIDENCE_THRESHOLD = 0.75  # From agents.yaml
    REGION_WEIGHT = 0.3

    def __init__(self, model_path: str | None = None, demo_mode: bool = True) -> None:
        """
        Initialize matching agent.

        Args:
            model_path: Path to fine-tuned BERT model weights.
            demo_mode: If True, use mock data instead of live model.
        """
        self.demo_mode = demo_mode
        self.model_path = model_path
        self._model: Any = None

        if not demo_mode and model_path:
            self._load_model(model_path)

        logger.info(f"MatchingAgent initialized (demo_mode={demo_mode})")

    def _load_model(self, model_path: str) -> None:
        """Load fine-tuned IndoBERT model from disk."""
        # Production: load PyTorch/ONNX model here
        logger.info(f"Loading model from {model_path}")
        self._model = None  # Placeholder for loaded model

    def _compute_skill_overlap(self, seeker_skills: list[str], job_skills: list[str]) -> float:
        """Calculate skill overlap ratio between seeker and job."""
        if not job_skills:
            return 0.0
        seeker_set = {s.lower() for s in seeker_skills}
        job_set = {s.lower() for s in job_skills}
        return len(seeker_set & job_set) / len(job_set)

    async def match(self, request: MatchingRequest) -> list[MatchCandidate]:
        """
        Execute matching pipeline.

        Args:
            request: MatchingRequest with seeker profile data.

        Returns:
            List of MatchCandidate sorted by match_score descending.
        """
        start_time = time.time()
        request_id = request.request_id

        logger.info(
            f"[{request_id}] Matching agent processing: "
            f"skills={request.seeker_skills}, region={request.seeker_region}"
        )

        if self.demo_mode:
            candidates = self._mock_match(request)
        else:
            candidates = await self._live_match(request)

        latency_ms = int((time.time() - start_time) * 1000)
        logger.info(
            f"[{request_id}] Matching completed: "
            f"{len(candidates)} results in {latency_ms}ms"
        )

        return candidates

    def _mock_match(self, request: MatchingRequest) -> list[MatchCandidate]:
        """Return mock match results for demo mode."""
        from src.api.main import MOCK_JOBS

        candidates = []
        for job in MOCK_JOBS:
            overlap = self._compute_skill_overlap(
                request.seeker_skills,
                job["required_skills"]
            )
            candidates.append(MatchCandidate(
                job_id=job["job_id"],
                title=job["title"],
                company=job["company"],
                match_score=job["match_score"],
                skill_overlap=overlap,
                region_match=(request.seeker_region == job.get("region_code", "")),
                salary_in_range=True,
                explanation=job["explanation"],
            ))

        candidates.sort(key=lambda c: c.match_score, reverse=True)
        return candidates[:request.top_k]

    async def _live_match(self, request: MatchingRequest) -> list[MatchCandidate]:
        """Production matching using loaded BERT model. Placeholder for now."""
        # Phase 4 implementation:
        # 1. Encode seeker profile with bi-encoder
        # 2. Retrieve from pgvector index
        # 3. Rerank with cross-encoder
        raise NotImplementedError("Live matching requires trained model (see ml/pipeline/04_train.py)")
