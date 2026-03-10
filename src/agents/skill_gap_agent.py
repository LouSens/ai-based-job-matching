"""
KerjaCerdas - Skill Gap Agent
==============================
Analyzes the gap between a seeker's current skills and a target job's requirements.
Uses LLM + RAG over course/certification databases to recommend learning paths.

ANTIGRAVITY PROTOCOL: skill_gap_agent | Model: Claude Sonnet | Latency SLA: <2000ms
"""
from __future__ import annotations

import logging
import time
from dataclasses import dataclass

import anthropic

logger = logging.getLogger(__name__)

SKILL_GAP_SYSTEM_PROMPT = """Kamu adalah analis karier berpengalaman untuk pasar kerja Indonesia.

Tugasmu: Analisis kesenjangan skill antara profil pencari kerja dan persyaratan pekerjaan.

Berikan output dalam format JSON berikut:
{
  "missing_skills": ["skill1", "skill2"],
  "matching_skills": ["skill3", "skill4"],
  "gap_severity": "low|medium|high",
  "recommended_courses": [
    {"name": "Nama Kursus", "provider": "Provider", "duration": "X bulan", "url": "url"}
  ],
  "estimated_readiness_months": 3,
  "confidence": 0.85,
  "summary": "Ringkasan dalam Bahasa Indonesia"
}

Gunakan data kursus dari: Prakerja, Coursera ID, Dicoding, Skill Academy, Ruangguru."""


@dataclass
class SkillGapResult:
    """Result of skill gap analysis."""
    missing_skills: list[str]
    matching_skills: list[str]
    gap_severity: str
    recommended_courses: list[dict]
    estimated_readiness_months: int
    confidence: float
    summary: str


class SkillGapAgent:
    """
    Analyzes skill gaps between seeker profiles and job requirements.

    Uses Claude to:
    1. Compare seeker skills vs job requirements
    2. Identify missing and matching skills
    3. Recommend courses from Indonesian learning platforms
    4. Estimate time to readiness
    """

    def __init__(self, api_key: str | None = None):
        """Initialize skill gap agent with Anthropic client."""
        self.client = anthropic.Anthropic(api_key=api_key)
        self.model = "claude-sonnet-4-20250514"

    async def analyze(
        self,
        seeker_skills: list[str],
        job_requirements: dict,
        seeker_experience_years: int = 0
    ) -> SkillGapResult:
        """
        Perform skill gap analysis.

        Args:
            seeker_skills: List of skills the seeker currently has
            job_requirements: Dict with required_skills, education_min, etc.
            seeker_experience_years: Years of work experience

        Returns:
            SkillGapResult with analysis and recommendations
        """
        start_time = time.time()

        prompt = f"""Analisis kesenjangan skill berikut:

PROFIL PENCARI KERJA:
- Skills: {', '.join(seeker_skills)}
- Pengalaman: {seeker_experience_years} tahun

PERSYARATAN PEKERJAAN:
- Judul: {job_requirements.get('title', 'N/A')}
- Skills yang dibutuhkan: {', '.join(job_requirements.get('required_skills', []))}
- Pendidikan minimum: {job_requirements.get('education_min', 'N/A')}
- Pengalaman minimum: {job_requirements.get('experience_years_min', 0)} tahun

Berikan analisis lengkap dalam format JSON."""

        response = self.client.messages.create(
            model=self.model,
            max_tokens=1000,
            system=SKILL_GAP_SYSTEM_PROMPT,
            messages=[{"role": "user", "content": prompt}]
        )

        import json
        raw = response.content[0].text
        # Strip markdown fences if present
        clean = raw.replace("```json", "").replace("```", "").strip()
        data = json.loads(clean)

        latency_ms = int((time.time() - start_time) * 1000)
        logger.info(f"Skill gap analysis completed in {latency_ms}ms, "
                    f"confidence={data.get('confidence', 0):.2f}")

        return SkillGapResult(
            missing_skills=data.get("missing_skills", []),
            matching_skills=data.get("matching_skills", []),
            gap_severity=data.get("gap_severity", "medium"),
            recommended_courses=data.get("recommended_courses", []),
            estimated_readiness_months=data.get("estimated_readiness_months", 3),
            confidence=data.get("confidence", 0.7),
            summary=data.get("summary", "")
        )