"""
KerjaCerdas - Skill Gap Agent
==============================
Analyzes the gap between a seeker's current skills and a target job's requirements.
Uses Gemini LLM + RAG over course/certification databases to recommend learning paths.

ANTIGRAVITY PROTOCOL: skill_gap_agent | Model: gemini-2.0-flash | Latency SLA: <2000ms
"""
from __future__ import annotations

import json
import logging
import time
from dataclasses import dataclass, field

from google import genai

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


@dataclass
class SkillGapContext:
    """Context for skill gap analysis from agents.yaml RAG sources."""

    data_sources: list[str] = field(
        default_factory=lambda: ["bps_occupations", "linkedin_skills", "dikti_courses"]
    )
    rag_top_k: int = 5


class SkillGapAgent:
    """
    Analyzes skill gaps between seeker profiles and job requirements.

    Uses Google Gemini to:
    1. Compare seeker skills vs job requirements
    2. Identify missing and matching skills
    3. Recommend courses from Indonesian learning platforms
    4. Estimate time to readiness

    RAG data sources (from agents.yaml):
    - BPS occupation taxonomy (KBJI codes)
    - LinkedIn Skills Graph
    - DIKTI accredited course catalog
    """

    def __init__(self, api_key: str | None = None, demo_mode: bool = True) -> None:
        """
        Initialize skill gap agent.

        Args:
            api_key: Google Gemini API key.
            demo_mode: If True, use deterministic analysis instead of LLM.
        """
        self.demo_mode = demo_mode

        if not demo_mode:
            self.client = genai.Client(api_key=api_key)
            self.model = "gemini-2.0-flash"
        else:
            self.client = None

        self.context = SkillGapContext()
        logger.info(f"SkillGapAgent initialized (demo_mode={demo_mode})")

    async def analyze(
        self,
        seeker_skills: list[str],
        job_requirements: dict,
        seeker_experience_years: int = 0,
    ) -> SkillGapResult:
        """
        Perform skill gap analysis.

        Args:
            seeker_skills: List of skills the seeker currently has.
            job_requirements: Dict with required_skills, education_min, etc.
            seeker_experience_years: Years of work experience.

        Returns:
            SkillGapResult with analysis and recommendations.
        """
        start_time = time.time()

        if self.demo_mode:
            result = self._deterministic_analyze(
                seeker_skills, job_requirements, seeker_experience_years
            )
        else:
            result = await self._llm_analyze(
                seeker_skills, job_requirements, seeker_experience_years
            )

        latency_ms = int((time.time() - start_time) * 1000)
        logger.info(
            f"Skill gap analysis completed in {latency_ms}ms, "
            f"confidence={result.confidence:.2f}, "
            f"severity={result.gap_severity}"
        )

        return result

    def _deterministic_analyze(
        self,
        seeker_skills: list[str],
        job_requirements: dict,
        seeker_experience_years: int,
    ) -> SkillGapResult:
        """
        Deterministic skill gap analysis for demo mode.

        No LLM call — uses set operations and a course recommendation lookup.
        """
        required = job_requirements.get("required_skills", [])
        seeker_set = {s.lower() for s in seeker_skills}
        required_set = {s.lower() for s in required}

        matching = sorted(seeker_set & required_set)
        missing = sorted(required_set - seeker_set)

        gap_ratio = len(missing) / max(len(required_set), 1)
        severity = "low" if gap_ratio < 0.3 else "medium" if gap_ratio < 0.6 else "high"

        # Course recommendation lookup table
        course_map = {
            "pytorch": {"name": "Deep Learning Specialization", "provider": "Coursera", "duration": "3 bulan"},
            "tensorflow": {"name": "TensorFlow Developer Certificate", "provider": "Coursera", "duration": "3 bulan"},
            "sql": {"name": "SQL untuk Analisis Data", "provider": "Dicoding", "duration": "1 bulan"},
            "docker": {"name": "Docker & Container Fundamentals", "provider": "Dicoding", "duration": "1 bulan"},
            "spark": {"name": "Apache Spark dengan Python", "provider": "Coursera", "duration": "2 bulan"},
            "kafka": {"name": "Event Streaming with Kafka", "provider": "Udemy", "duration": "1 bulan"},
            "go": {"name": "Pemrograman Go Dasar", "provider": "Dicoding", "duration": "2 bulan"},
            "tableau": {"name": "Tableau untuk Analisis Data", "provider": "Coursera", "duration": "1 bulan"},
            "r": {"name": "R Programming", "provider": "Coursera", "duration": "1 bulan"},
        }

        courses = []
        for skill in missing:
            if skill in course_map:
                courses.append(course_map[skill])
        if not courses:
            courses.append(
                {"name": "Advanced Python Programming", "provider": "Skill Academy", "duration": "2 bulan"}
            )

        match_pct = round((1 - gap_ratio) * 100, 1)

        return SkillGapResult(
            missing_skills=missing,
            matching_skills=matching,
            gap_severity=severity,
            recommended_courses=courses,
            estimated_readiness_months=max(1, len(missing)),
            confidence=0.82,
            summary=(
                f"Kamu sudah memiliki {len(matching)} dari {len(required_set)} "
                f"skill yang dibutuhkan ({match_pct}%). "
                f"Fokus belajar {', '.join(missing[:3])} untuk meningkatkan peluang."
            ),
        )

    async def _llm_analyze(
        self,
        seeker_skills: list[str],
        job_requirements: dict,
        seeker_experience_years: int,
    ) -> SkillGapResult:
        """
        Use Google Gemini for intelligent skill gap analysis.

        Production: This will be enhanced with RAG over course catalogs.
        """
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

        full_prompt = f"{SKILL_GAP_SYSTEM_PROMPT}\n\n{prompt}"

        response = self.client.models.generate_content(
            model=self.model,
            contents=full_prompt,
        )

        raw = response.text
        clean = raw.replace("```json", "").replace("```", "").strip()
        data = json.loads(clean)

        return SkillGapResult(
            missing_skills=data.get("missing_skills", []),
            matching_skills=data.get("matching_skills", []),
            gap_severity=data.get("gap_severity", "medium"),
            recommended_courses=data.get("recommended_courses", []),
            estimated_readiness_months=data.get("estimated_readiness_months", 3),
            confidence=data.get("confidence", 0.7),
            summary=data.get("summary", ""),
        )