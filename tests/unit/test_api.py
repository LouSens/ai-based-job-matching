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
