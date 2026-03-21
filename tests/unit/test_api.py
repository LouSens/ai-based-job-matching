"""
KerjaCerdas — Unit Tests: API Endpoints
=========================================
Tests for FastAPI endpoints in demo mode.

ANTIGRAVITY PROTOCOL: All API changes require test updates.
"""
from __future__ import annotations

import pytest
from fastapi.testclient import TestClient

from src.api.main import app


@pytest.fixture
def client():
    """Create test client for FastAPI app."""
    return TestClient(app)


class TestHealthCheck:
    """Test health check endpoint."""

    def test_health_returns_200(self, client: TestClient) -> None:
        """Health endpoint should return 200 with service info."""
        response = client.get("/health")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "healthy"
        assert data["service"] == "KerjaCerdas API"
        assert data["version"] == "0.1.0"


class TestMatchEndpoint:
    """Test job matching endpoint."""

    def test_match_returns_results(self, client: TestClient) -> None:
        """Match endpoint should return ranked job results."""
        payload = {
            "seeker_profile": {
                "name": "Budi Santoso",
                "skills": ["Python", "SQL", "Excel"],
                "experience_years": 1,
                "education_level": "S1",
                "region_code": "3171",
                "salary_expectation": 12000000,
            },
            "top_k": 5,
        }
        response = client.post("/api/v1/match", json=payload)
        assert response.status_code == 200
        data = response.json()
        assert "matches" in data
        assert "request_id" in data
        assert len(data["matches"]) <= 5

    def test_match_scores_are_sorted(self, client: TestClient) -> None:
        """Match results should be sorted by match_score descending."""
        payload = {
            "seeker_profile": {
                "name": "Test User",
                "skills": ["Python"],
                "experience_years": 0,
                "education_level": "S1",
                "region_code": "3171",
                "salary_expectation": 8000000,
            },
            "top_k": 10,
        }
        response = client.post("/api/v1/match", json=payload)
        data = response.json()
        scores = [m["match_score"] for m in data["matches"]]
        assert scores == sorted(scores, reverse=True)


class TestSkillGapEndpoint:
    """Test skill gap analysis endpoint."""

    def test_skill_gap_identifies_missing(self, client: TestClient) -> None:
        """Skill gap should correctly identify missing skills."""
        payload = {
            "seeker_skills": ["Python", "SQL"],
            "required_skills": ["Python", "SQL", "Docker", "Kubernetes"],
        }
        response = client.post("/api/v1/skill-gap", json=payload)
        assert response.status_code == 200
        data = response.json()
        assert "docker" in data["missing_skills"]
        assert "python" in data["matching_skills"]

    def test_skill_gap_severity_levels(self, client: TestClient) -> None:
        """Severity should reflect gap ratio correctly."""
        # Low gap: 1 missing out of 4
        payload = {
            "seeker_skills": ["Python", "SQL", "Excel"],
            "required_skills": ["Python", "SQL", "Excel", "Tableau"],
        }
        response = client.post("/api/v1/skill-gap", json=payload)
        assert response.json()["gap_severity"] == "low"


class TestJobsEndpoint:
    """Test jobs listing endpoint."""

    def test_list_jobs(self, client: TestClient) -> None:
        """Jobs endpoint should return a list of job postings."""
        response = client.get("/api/v1/jobs?limit=3")
        assert response.status_code == 200
        data = response.json()
        assert "jobs" in data
        assert len(data["jobs"]) <= 3


class TestStartupConfiguration:
    """Test application startup wiring."""

    @pytest.mark.asyncio
    async def test_lifespan_reconfigures_database_before_init(self, monkeypatch: pytest.MonkeyPatch) -> None:
        """Startup should point SQLAlchemy at settings.database_url before table creation."""
        calls: list[tuple[str, str]] = []

        def fake_reconfigure(database_url: str) -> None:
            calls.append(("reconfigure", database_url))

        async def fake_init_db() -> None:
            calls.append(("init_db", ""))

        def fake_configure_auth(secret_key: str, expire_minutes: int) -> None:
            calls.append(("configure_auth", secret_key))

        monkeypatch.setattr("src.api.main.reconfigure", fake_reconfigure)
        monkeypatch.setattr("src.api.main.init_db", fake_init_db)
        monkeypatch.setattr("src.api.main.configure_auth", fake_configure_auth)
        monkeypatch.setattr("src.api.main.settings.database_url", "postgresql://example/db")
        monkeypatch.setattr("src.api.main.settings.jwt_secret_key", "configured-secret")
        monkeypatch.setattr("src.api.main.settings.app_env", "development")

        async with app.router.lifespan_context(app):
            pass

        assert calls[0] == ("reconfigure", "postgresql://example/db")
        assert calls[1] == ("init_db", "")
        assert calls[2] == ("configure_auth", "configured-secret")

    @pytest.mark.asyncio
    async def test_lifespan_generates_ephemeral_secret_outside_production(
        self,
        monkeypatch: pytest.MonkeyPatch,
    ) -> None:
        """Development startup should succeed with a generated JWT secret."""
        captured: dict[str, str] = {}

        def fake_reconfigure(database_url: str) -> None:
            return None

        async def fake_init_db() -> None:
            return None

        def fake_configure_auth(secret_key: str, expire_minutes: int) -> None:
            captured["secret_key"] = secret_key

        monkeypatch.setattr("src.api.main.reconfigure", fake_reconfigure)
        monkeypatch.setattr("src.api.main.init_db", fake_init_db)
        monkeypatch.setattr("src.api.main.configure_auth", fake_configure_auth)
        monkeypatch.setattr("src.api.main.settings.jwt_secret_key", "")
        monkeypatch.setattr("src.api.main.settings.app_env", "development")

        async with app.router.lifespan_context(app):
            pass

        assert captured["secret_key"]

    @pytest.mark.asyncio
    async def test_lifespan_requires_secret_in_production(self, monkeypatch: pytest.MonkeyPatch) -> None:
        """Production startup should fail fast without a configured JWT secret."""
        def fake_reconfigure(database_url: str) -> None:
            return None

        async def fake_init_db() -> None:
            return None

        monkeypatch.setattr("src.api.main.reconfigure", fake_reconfigure)
        monkeypatch.setattr("src.api.main.init_db", fake_init_db)
        monkeypatch.setattr("src.api.main.settings.jwt_secret_key", "")
        monkeypatch.setattr("src.api.main.settings.app_env", "production")

        with pytest.raises(RuntimeError, match="JWT_SECRET_KEY must be set"):
            async with app.router.lifespan_context(app):
                pass
