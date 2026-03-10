"""
KerjaCerdas — Advisor Agent
==============================
Career advisor LLM agent powered by Google Gemini.
Provides personalized career guidance in Bahasa Indonesia.

ANTIGRAVITY PROTOCOL: advisor_agent | Model: gemini-2.0-flash | Latency SLA: <3000ms
"""
from __future__ import annotations

import logging
import time
import uuid
from dataclasses import dataclass, field

from google import genai

logger = logging.getLogger(__name__)


ADVISOR_SYSTEM_PROMPT = """Kamu adalah konselor karier berpengalaman dengan 10 tahun pengalaman \
di pasar kerja Indonesia.

Tugasmu:
- Berikan saran karier yang personal, actionable, dan relevan
- Gunakan Bahasa Indonesia yang ramah dan profesional
- Pertimbangkan konteks pasar kerja Indonesia (regional, industri, salary benchmark)
- Referensikan platform lokal (JobStreet, Kalibrr, LinkedIn Indonesia)
- Maksimum 3 paragraf per respons

Kamu SELALU memberikan saran yang spesifik, bukan umum. Sertakan angka, nama perusahaan, \
dan langkah konkret jika memungkinkan."""


@dataclass
class AdvisorContext:
    """Context for advisor conversation."""

    seeker_name: str = ""
    seeker_skills: list[str] = field(default_factory=list)
    seeker_experience_years: int = 0
    seeker_region: str = ""
    conversation_history: list[dict[str, str]] = field(default_factory=list)


@dataclass
class AdvisorResponse:
    """Response from advisor agent."""

    request_id: str
    response_text: str
    confidence: float
    latency_ms: int
    agent: str = "advisor_agent"
    fallback_used: bool = False


class AdvisorAgent:
    """
    AI career advisor powered by Google Gemini.

    Capabilities:
    - Personalized career path recommendations
    - Salary negotiation guidance for Indonesia market
    - CV/resume improvement tips
    - Job market trend analysis per region
    - Upskilling roadmap suggestions

    Maintains conversation history for multi-turn dialogues.
    """

    def __init__(self, api_key: str | None = None, demo_mode: bool = True) -> None:
        """
        Initialize advisor agent.

        Args:
            api_key: Google Gemini API key (from config/settings.py).
            demo_mode: If True, return pre-scripted responses.
        """
        self.demo_mode = demo_mode
        self._demo_idx = 0

        if not demo_mode:
            self.client = genai.Client(api_key=api_key)
            self.model = "gemini-2.0-flash"
        else:
            self.client = None

        logger.info(f"AdvisorAgent initialized (demo_mode={demo_mode})")

    # Pre-scripted demo responses (Bahasa Indonesia)
    _DEMO_RESPONSES = [
        (
            "Berdasarkan profil kamu, saya rekomendasikan untuk fokus ke karier "
            "**Data Analyst** dulu sebagai batu loncatan. Skill Python dan SQL kamu "
            "sudah solid — ini fondasi yang sangat berharga.\n\n"
            "Langkah konkretnya: tambahkan Tableau atau Power BI (2-4 minggu belajar) "
            "dan ikuti proyek portfolio di Kaggle. Ini akan membuat CV kamu jauh lebih "
            "menarik bagi rekruter.\n\n"
            "Setelah 1-2 tahun sebagai Data Analyst, kamu bisa pivot ke Machine Learning "
            "Engineer dengan pengalaman domain yang kuat."
        ),
        (
            "Untuk fresh graduate di Indonesia tahun 2026, peluang terbaik ada di sektor "
            "**fintech dan e-commerce** — kedua industri ini aktif merekrut data talent.\n\n"
            "Bank digital seperti SeaBank, Blu, dan Jago sedang ekspansi besar-besaran. "
            "Mereka sering lebih terbuka terhadap kandidat dengan skill ML.\n\n"
            "Tips salary negotiation: riset benchmark gaji di Glassdoor dan LinkedIn. "
            "Data Analyst junior di Jakarta range Rp 7-12 juta adalah angka wajar."
        ),
        (
            "Untuk meningkatkan peluang lolos screening ATS, pastikan CV kamu menggunakan "
            "**keyword yang sama** dengan job description.\n\n"
            "Format CV: 1 halaman untuk fresh graduate, 2 halaman untuk 3+ tahun. "
            "Gunakan bullet points dengan angka konkret: 'Meningkatkan efisiensi query "
            "SQL sebesar 40%' lebih kuat dari 'Mengerjakan analisis data'.\n\n"
            "Portfolio GitHub aktif adalah differentiator besar — banyak kandidat data "
            "tidak punya ini."
        ),
    ]

    async def advise(
        self,
        message: str,
        context: AdvisorContext,
    ) -> AdvisorResponse:
        """
        Generate career advice based on user message and context.

        Args:
            message: User's question or request in natural language.
            context: Seeker profile and conversation history.

        Returns:
            AdvisorResponse with personalized advice.
        """
        start_time = time.time()
        request_id = str(uuid.uuid4())

        logger.info(
            f"[{request_id}] Advisor processing: "
            f"'{message[:50]}...' for {context.seeker_name}"
        )

        if self.demo_mode:
            response_text = self._demo_respond()
            confidence = 0.88
        else:
            response_text, confidence = await self._live_advise(message, context)

        latency_ms = int((time.time() - start_time) * 1000)

        logger.info(
            f"[{request_id}] Advisor completed in {latency_ms}ms, "
            f"confidence={confidence:.2f}"
        )

        return AdvisorResponse(
            request_id=request_id,
            response_text=response_text,
            confidence=confidence,
            latency_ms=latency_ms,
        )

    def _demo_respond(self) -> str:
        """Return pre-scripted demo response and rotate index."""
        response = self._DEMO_RESPONSES[self._demo_idx % len(self._DEMO_RESPONSES)]
        self._demo_idx += 1
        return response

    async def _live_advise(
        self,
        message: str,
        context: AdvisorContext,
    ) -> tuple[str, float]:
        """
        Call Google Gemini for live career advice.

        Args:
            message: User question.
            context: Conversation context.

        Returns:
            Tuple of (response_text, confidence_score).
        """
        profile_context = (
            f"Profil pengguna:\n"
            f"- Nama: {context.seeker_name}\n"
            f"- Skills: {', '.join(context.seeker_skills)}\n"
            f"- Pengalaman: {context.seeker_experience_years} tahun\n"
            f"- Lokasi: {context.seeker_region}\n"
        )

        full_prompt = f"{ADVISOR_SYSTEM_PROMPT}\n\n{profile_context}\n\nPertanyaan: {message}"

        response = self.client.models.generate_content(
            model=self.model,
            contents=full_prompt,
        )

        return response.text, 0.85
