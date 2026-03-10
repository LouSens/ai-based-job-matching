"""
KerjaCerdas — Data Agent
==========================
Data ingestion, cleaning, and refresh agent.
Scheduled nightly to fetch and process job postings from multiple sources.

ANTIGRAVITY PROTOCOL: data_agent | Schedule: 0 2 * * * | Validation: strict
"""
from __future__ import annotations

import logging
import time
import uuid
from dataclasses import dataclass, field
from enum import Enum
from typing import Any

logger = logging.getLogger(__name__)


class DataSource(str, Enum):
    """Supported data sources for job ingestion."""

    JOBSTREET = "jobstreet_api"
    INDEED = "indeed_scrape"
    BPS = "bps_open_data"


class DedupStrategy(str, Enum):
    """Deduplication strategies for ingested data."""

    EXACT = "exact_match"
    FUZZY = "fuzzy_match"


@dataclass
class IngestionResult:
    """Result of a data ingestion run."""

    request_id: str = field(default_factory=lambda: str(uuid.uuid4()))
    source: str = ""
    records_fetched: int = 0
    records_valid: int = 0
    records_duplicate: int = 0
    records_inserted: int = 0
    latency_ms: int = 0
    errors: list[str] = field(default_factory=list)


class DataAgent:
    """
    Data ingestion and cleaning agent.

    Responsibilities:
    - Fetch job postings from configured sources (agents.yaml)
    - Validate schema and data quality (strict mode)
    - Deduplicate using fuzzy matching
    - Store cleaned data in PostgreSQL + Parquet files
    - Trigger feature store refresh after ingestion

    Schedule: 2AM daily (configured in agents.yaml)

    Data flow:
        External APIs → DataAgent → raw/*.parquet → 02_preprocess.py → processed/
    """

    def __init__(
        self,
        sources: list[str] | None = None,
        dedup_strategy: str = "fuzzy_match",
        demo_mode: bool = True,
    ) -> None:
        """
        Initialize data agent.

        Args:
            sources: List of data source identifiers from config.
            dedup_strategy: How to handle duplicates.
            demo_mode: If True, use mock data.
        """
        self.sources = sources or [s.value for s in DataSource]
        self.dedup_strategy = DedupStrategy(dedup_strategy)
        self.demo_mode = demo_mode

        logger.info(
            f"DataAgent initialized: sources={self.sources}, "
            f"dedup={self.dedup_strategy.value}, demo_mode={demo_mode}"
        )

    async def ingest(self, source: str | None = None) -> list[IngestionResult]:
        """
        Run data ingestion from one or all configured sources.

        Args:
            source: Specific source to ingest from, or None for all.

        Returns:
            List of IngestionResult for each source processed.
        """
        targets = [source] if source else self.sources
        results = []

        for src in targets:
            logger.info(f"Ingesting from {src}...")
            start_time = time.time()

            if self.demo_mode:
                result = self._mock_ingest(src)
            else:
                result = await self._live_ingest(src)

            result.latency_ms = int((time.time() - start_time) * 1000)
            results.append(result)

            logger.info(
                f"Ingestion from {src} completed: "
                f"{result.records_inserted} new records in {result.latency_ms}ms"
            )

        return results

    def _mock_ingest(self, source: str) -> IngestionResult:
        """Return mock ingestion results for demo mode."""
        mock_counts = {
            "jobstreet_api": (1500, 1420, 85, 1335),
            "indeed_scrape": (2200, 2100, 310, 1790),
            "bps_open_data": (800, 795, 20, 775),
        }
        fetched, valid, dupes, inserted = mock_counts.get(source, (100, 95, 5, 90))

        return IngestionResult(
            source=source,
            records_fetched=fetched,
            records_valid=valid,
            records_duplicate=dupes,
            records_inserted=inserted,
        )

    async def _live_ingest(self, source: str) -> IngestionResult:
        """
        Live ingestion from external source. Placeholder for production.

        Production implementation will connect to:
        - JobStreet API (official partner API)
        - Indeed web scraping (with rate limiting)
        - BPS Open Data REST API
        """
        raise NotImplementedError(
            f"Live ingestion from {source} requires API credentials. "
            "See config/agents.yaml for required setup."
        )

    async def validate_record(self, record: dict[str, Any]) -> bool:
        """
        Validate a single job posting record against schema.

        Args:
            record: Dictionary representing a job posting.

        Returns:
            True if record passes validation.
        """
        required_fields = ["title", "company", "region_code", "required_skills"]
        for field_name in required_fields:
            if field_name not in record or not record[field_name]:
                logger.warning(f"Validation failed: missing {field_name}")
                return False
        return True

    async def deduplicate(
        self,
        records: list[dict[str, Any]],
    ) -> list[dict[str, Any]]:
        """
        Remove duplicate records using configured strategy.

        Args:
            records: List of job posting dicts.

        Returns:
            Deduplicated list of records.
        """
        if self.dedup_strategy == DedupStrategy.EXACT:
            seen = set()
            unique = []
            for r in records:
                key = (r.get("title", ""), r.get("company", ""))
                if key not in seen:
                    seen.add(key)
                    unique.append(r)
            return unique

        # Fuzzy matching: compare title similarity > 0.85 threshold
        # Production: use RapidFuzz or similar library
        return records  # Placeholder — returns all in demo
