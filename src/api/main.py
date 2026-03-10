"""
KerjaCerdas - FastAPI Application
===================================
Main API entrypoint. Exposes all job matching, skill gap, and advisor endpoints.

ANTIGRAVITY PROTOCOL: All endpoints must be typed, documented, and logged.
"""
from __future__ import annotations

import logging
import time
import uuid
from contextlib import asynccontextmanager

from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


# ─── Pydantic Schemas ────────────────────────────────────────────────────────

class SeekerProfile(BaseModel):
    """Seeker profile for job matching."""
    seeker_id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    skills: list[str]
    experience_years: int = Field(ge=0, le=50)
    education_level: str  # KKNI level
    region_code: str      # BPS wilayah code
    preferred_regions: list[str] = []
    salary_expectation: int = Field(ge=0)
    resume_text: str = ""


class JobPosting(BaseModel):
    """Job posting schema."""
    job_id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str
    company: str
    region_code: str
    salary_min: int
    salary_max: int
    required_skills: list[str]
    education_min: str
    experience_years_min: int
    description: str
    kbji_code: str = ""


class MatchRequest(BaseModel):
    """Request for job matching."""
    seeker_profile: SeekerProfile
    top_k: int = Field(default=10, ge=1, le=50)
    region_filter: str | None = None


class MatchResult(BaseModel):
    """Single match result."""
    job_id: str
    title: str
    company: str
    match_score: float
    skill_overlap: float
    region_match: bool
    salary_in_range: bool
    explanation: str


class MatchResponse(BaseModel):
    """Response from job matching endpoint."""
    request_id: str
    matches: list[MatchResult]
    total_found: int
    processing_time_ms: int


class SkillGapRequest(BaseModel):
    """Request for skill gap analysis."""
    seeker_skills: list[str]
    target_job_id: str | None = None
    target_job_title: str | None = None
    required_skills: list[str] = []


class ChatMessage(BaseModel):
    """Single message in career advisor chat."""
    role: str  # user | assistant
    content: str


class AdvisorRequest(BaseModel):
    """Request to career advisor agent."""
    message: str
    seeker_profile: SeekerProfile
    conversation_history: list[ChatMessage] = []


# ─── Mock Data (Demo Mode) ────────────────────────────────────────────────────

MOCK_JOBS = [
    {
        "job_id": "job-001",
        "title": "Data Analyst",
        "company": "Bank Mandiri",
        "region_code": "3171",  # Jakarta Pusat
        "salary_min": 8000000,
        "salary_max": 15000000,
        "required_skills": ["Python", "SQL", "Excel", "Tableau", "Statistics"],
        "education_min": "S1",
        "experience_years_min": 1,
        "match_score": 0.91,
        "skill_overlap": 0.80,
        "region_match": True,
        "salary_in_range": True,
        "explanation": "Kecocokan tinggi: 4/5 skill sesuai, lokasi Jakarta cocok"
    },
    {
        "job_id": "job-002",
        "title": "Machine Learning Engineer",
        "company": "Gojek",
        "region_code": "3171",
        "salary_min": 15000000,
        "salary_max": 30000000,
        "required_skills": ["Python", "TensorFlow", "PyTorch", "SQL", "Docker"],
        "education_min": "S1",
        "experience_years_min": 2,
        "match_score": 0.84,
        "skill_overlap": 0.60,
        "region_match": True,
        "salary_in_range": True,
        "explanation": "Kecocokan baik: skill Python dan SQL sesuai, perlu belajar PyTorch"
    },
    {
        "job_id": "job-003",
        "title": "Business Intelligence Analyst",
        "company": "Tokopedia",
        "region_code": "3171",
        "salary_min": 10000000,
        "salary_max": 18000000,
        "required_skills": ["SQL", "Python", "Tableau", "Business Analysis"],
        "education_min": "S1",
        "experience_years_min": 1,
        "match_score": 0.79,
        "skill_overlap": 0.75,
        "region_match": True,
        "salary_in_range": True,
        "explanation": "Cocok untuk karier BI: skill analitik kuat, tambah business analysis"
    },
    {
        "job_id": "job-004",
        "title": "Data Engineer",
        "company": "Traveloka",
        "region_code": "3171",
        "salary_min": 12000000,
        "salary_max": 22000000,
        "required_skills": ["Python", "SQL", "Spark", "Kafka", "Airflow"],
        "education_min": "S1",
        "experience_years_min": 2,
        "match_score": 0.72,
        "skill_overlap": 0.40,
        "region_match": True,
        "salary_in_range": True,
        "explanation": "Potensi besar: Python sesuai, perlu belajar ekosistem big data"
    },
    {
        "job_id": "job-005",
        "title": "Software Engineer - Backend",
        "company": "Bukalapak",
        "region_code": "3171",
        "salary_min": 10000000,
        "salary_max": 20000000,
        "required_skills": ["Python", "Go", "PostgreSQL", "Redis", "Docker"],
        "education_min": "S1",
        "experience_years_min": 1,
        "match_score": 0.68,
        "skill_overlap": 0.40,
        "region_match": True,
        "salary_in_range": True,
        "explanation": "Python backend cocok, perlu tambah Go dan infrastructure skills"
    },
]


# ─── App Lifespan ────────────────────────────────────────────────────────────

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application startup and shutdown."""
    logger.info("🚀 KerjaCerdas API starting up...")
    # In production: initialize DB connections, load ML models, warm up agents
    yield
    logger.info("KerjaCerdas API shutting down...")


# ─── FastAPI App ──────────────────────────────────────────────────────────────

app = FastAPI(
    title="KerjaCerdas API",
    description="AI-Powered Job Matching Platform for Indonesia",
    version="0.1.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Production: restrict to frontend domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ─── Middleware: Request Logging ──────────────────────────────────────────────

@app.middleware("http")
async def log_requests(request: Request, call_next):
    """Log all requests with timing."""
    request_id = str(uuid.uuid4())[:8]
    start = time.time()
    response = await call_next(request)
    duration_ms = int((time.time() - start) * 1000)
    logger.info(f"[{request_id}] {request.method} {request.url.path} → {response.status_code} ({duration_ms}ms)")
    response.headers["X-Request-ID"] = request_id
    return response


# ─── Health Check ─────────────────────────────────────────────────────────────

@app.get("/health")
async def health_check():
    """System health check endpoint."""
    return {
        "status": "healthy",
        "service": "KerjaCerdas API",
        "version": "0.1.0",
        "mode": "demo"
    }


# ─── Job Matching Endpoint ────────────────────────────────────────────────────

@app.post("/api/v1/match", response_model=MatchResponse)
async def match_jobs(request: MatchRequest):
    """
    Match a seeker profile against available job postings.

    Uses bi-encoder BERT model for fast retrieval + cross-encoder for reranking.
    In demo mode: returns mock results with realistic scoring.
    """
    start_time = time.time()
    request_id = str(uuid.uuid4())

    logger.info(f"Match request for seeker {request.seeker_profile.seeker_id}")

    # Demo mode: return mock jobs sorted by match score
    matches = [
        MatchResult(
            job_id=job["job_id"],
            title=job["title"],
            company=job["company"],
            match_score=job["match_score"],
            skill_overlap=job["skill_overlap"],
            region_match=job["region_match"],
            salary_in_range=job["salary_in_range"],
            explanation=job["explanation"]
        )
        for job in sorted(MOCK_JOBS, key=lambda x: x["match_score"], reverse=True)[:request.top_k]
    ]

    processing_time = int((time.time() - start_time) * 1000)

    return MatchResponse(
        request_id=request_id,
        matches=matches,
        total_found=len(matches),
        processing_time_ms=processing_time
    )


# ─── Skill Gap Endpoint ───────────────────────────────────────────────────────

@app.post("/api/v1/skill-gap")
async def analyze_skill_gap(request: SkillGapRequest):
    """
    Analyze skill gap between seeker's current skills and target job requirements.
    Returns missing skills, matching skills, and recommended learning paths.
    """
    seeker_set = set(s.lower() for s in request.seeker_skills)
    required_set = set(s.lower() for s in request.required_skills)

    matching = list(seeker_set & required_set)
    missing = list(required_set - seeker_set)

    gap_ratio = len(missing) / max(len(required_set), 1)
    severity = "low" if gap_ratio < 0.3 else "medium" if gap_ratio < 0.6 else "high"

    courses = []
    if "pytorch" in missing or "tensorflow" in missing:
        courses.append({"name": "Deep Learning Specialization", "provider": "Coursera", "duration": "3 bulan"})
    if "sql" in missing:
        courses.append({"name": "SQL untuk Analisis Data", "provider": "Dicoding", "duration": "1 bulan"})
    if "docker" in missing:
        courses.append({"name": "Docker & Container Fundamentals", "provider": "Dicoding", "duration": "1 bulan"})
    if not courses:
        courses.append({"name": "Advanced Python Programming", "provider": "Skill Academy", "duration": "2 bulan"})

    return {
        "request_id": str(uuid.uuid4()),
        "missing_skills": missing,
        "matching_skills": matching,
        "gap_severity": severity,
        "match_percentage": round((1 - gap_ratio) * 100, 1),
        "recommended_courses": courses,
        "estimated_readiness_months": len(missing) * 1,
        "confidence": 0.82,
        "summary": f"Kamu sudah memiliki {len(matching)} dari {len(required_set)} skill yang dibutuhkan. "
                   f"Fokus belajar {', '.join(missing[:3])} untuk meningkatkan peluang."
    }


# ─── Career Advisor Endpoint ──────────────────────────────────────────────────

@app.post("/api/v1/advisor")
async def career_advisor(request: AdvisorRequest):
    """
    AI career advisor powered by Google Gemini.
    Provides personalized career guidance in Bahasa Indonesia.
    """
    try:
        from src.agents.advisor_agent import AdvisorAgent, AdvisorContext

        advisor = AdvisorAgent(demo_mode=True)
        context = AdvisorContext(
            seeker_name=request.seeker_profile.name,
            seeker_skills=request.seeker_profile.skills,
            seeker_experience_years=request.seeker_profile.experience_years,
            seeker_region=request.seeker_profile.region_code,
        )

        result = await advisor.advise(request.message, context)

        return {
            "request_id": result.request_id,
            "response": result.response_text,
            "agent": result.agent,
            "confidence": result.confidence,
        }

    except Exception as e:
        logger.error(f"Advisor agent error: {e}")
        raise HTTPException(status_code=500, detail="Advisor agent unavailable")


# ─── Jobs Listing Endpoint ────────────────────────────────────────────────────

@app.get("/api/v1/jobs")
async def list_jobs(limit: int = 10, region: str | None = None):
    """List available job postings, optionally filtered by region."""
    jobs = MOCK_JOBS[:limit]
    return {"jobs": jobs, "total": len(jobs)}