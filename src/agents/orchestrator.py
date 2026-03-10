"""
KerjaCerdas - Orchestrator Agent
=================================
Master coordinator for all KerjaCerdas AI agents.
Routes requests, manages agent lifecycle, and aggregates results.

ANTIGRAVITY PROTOCOL: orchestrator | Model: gemini-2.0-flash | Latency SLA: <500ms
"""
from __future__ import annotations

import asyncio
import json
import logging
import time
import uuid
from dataclasses import dataclass, field
from enum import Enum
from typing import Any

from google import genai

logger = logging.getLogger(__name__)


class AgentType(str, Enum):
    """Available agent types in the KerjaCerdas system."""

    MATCHING = "matching_agent"
    SKILL_GAP = "skill_gap_agent"
    ADVISOR = "advisor_agent"
    DATA = "data_agent"


@dataclass
class AgentRequest:
    """
    Standardized request envelope for all agent calls.

    Per PROTOCOL §4.3: Every agent call MUST include
    request_id, agent_id, timestamp, payload, confidence.
    """

    request_id: str = field(default_factory=lambda: str(uuid.uuid4()))
    agent_id: str = ""
    timestamp: float = field(default_factory=time.time)
    payload: dict[str, Any] = field(default_factory=dict)
    user_id: str = ""
    session_id: str = ""


@dataclass
class AgentResponse:
    """
    Standardized response envelope from all agent calls.

    Per PROTOCOL §4.3: Every agent response MUST return
    request_id, result, confidence, reasoning, latency_ms.
    """

    request_id: str
    agent_id: str
    result: Any
    confidence: float
    reasoning: str
    latency_ms: int
    fallback_used: bool = False
    error: str | None = None


class OrchestratorAgent:
    """
    Master orchestrator that routes user requests to appropriate agents.

    Decision logic:
    - Job search query → matching_agent
    - Profile with skill gap question → skill_gap_agent
    - Career advice request → advisor_agent
    - Ambiguous → LLM routing decision via Gemini

    Escalation rules (from agents.md):
    - confidence < threshold → escalate to orchestrator
    - 3 retries failed → return graceful fallback response
    - latency > 2x SLA → log alert, use cached result
    """

    ROUTING_SYSTEM_PROMPT = (
        "You are the routing brain of KerjaCerdas, Indonesia's AI job matching platform.\n\n"
        "Given a user message, decide which agent(s) to invoke:\n"
        "- matching_agent: User wants job recommendations or matching\n"
        "- skill_gap_agent: User wants to know what skills they're missing\n"
        "- advisor_agent: User wants career advice or path guidance\n\n"
        'Respond ONLY with JSON: {"agents": ["agent_name"], "reasoning": "brief reason"}\n'
        "Language: Bahasa Indonesia."
    )

    def __init__(self, api_key: str | None = None, demo_mode: bool = True) -> None:
        """
        Initialize orchestrator with Google Gemini client.

        Args:
            api_key: Google Gemini API key.
            demo_mode: If True, use rule-based routing instead of LLM.
        """
        self.demo_mode = demo_mode
        self.model = "gemini-2.0-flash"
        self._agent_registry: dict[AgentType, Any] = {}

        if not demo_mode:
            self.client = genai.Client(api_key=api_key)
        else:
            self.client = None

        logger.info(f"OrchestratorAgent initialized (demo_mode={demo_mode})")

    def register_agent(self, agent_type: AgentType, agent_instance: Any) -> None:
        """Register an agent instance for routing."""
        self._agent_registry[agent_type] = agent_instance
        logger.info(f"Registered agent: {agent_type.value}")

    async def route(self, request: AgentRequest) -> list[str]:
        """
        Determine which agents to invoke for the given request.

        In demo mode: uses keyword-based routing.
        In production: uses Gemini LLM for intelligent routing.

        Args:
            request: Standardized agent request with user payload.

        Returns:
            List of agent type names to invoke.
        """
        user_message = request.payload.get("message", "").lower()

        if self.demo_mode:
            return self._rule_based_route(user_message)

        return await self._llm_route(request)

    def _rule_based_route(self, message: str) -> list[str]:
        """Simple keyword-based routing for demo mode."""
        skill_keywords = ["skill", "gap", "kurang", "belajar", "kursus", "missing"]
        advice_keywords = ["karier", "saran", "advisor", "career", "tips", "gaji", "salary"]
        match_keywords = ["cari", "kerja", "lowongan", "job", "match", "cocok"]

        agents = []

        if any(kw in message for kw in skill_keywords):
            agents.append("skill_gap_agent")
        if any(kw in message for kw in advice_keywords):
            agents.append("advisor_agent")
        if any(kw in message for kw in match_keywords) or not agents:
            agents.append("matching_agent")

        return agents

    async def _llm_route(self, request: AgentRequest) -> list[str]:
        """Use Gemini LLM for intelligent request routing."""
        user_message = request.payload.get("message", "")

        response = self.client.models.generate_content(
            model=self.model,
            contents=f"{self.ROUTING_SYSTEM_PROMPT}\n\nUser message: {user_message}",
        )

        try:
            routing = json.loads(response.text)
            return routing.get("agents", ["matching_agent"])
        except (json.JSONDecodeError, KeyError):
            logger.warning(
                f"Routing parse failed for request {request.request_id}, "
                "defaulting to matching"
            )
            return ["matching_agent"]

    async def process(
        self,
        user_message: str,
        user_profile: dict[str, Any],
        session_id: str = "",
    ) -> dict[str, AgentResponse]:
        """
        Main entry point: process a user request through the agent pipeline.

        Args:
            user_message: Natural language input from user.
            user_profile: Seeker profile dict.
            session_id: Optional session ID for tracking.

        Returns:
            Dict of agent_name → AgentResponse.
        """
        request = AgentRequest(
            agent_id="orchestrator",
            payload={"message": user_message, "profile": user_profile},
            session_id=session_id,
        )

        logger.info(f"Processing request {request.request_id}: {user_message[:50]}...")

        # Route to appropriate agents
        target_agents = await self.route(request)

        # Execute agents (parallel where possible)
        tasks: list[tuple[str, Any]] = []
        for agent_name in target_agents:
            agent_type = AgentType(agent_name)
            if agent_type in self._agent_registry:
                agent = self._agent_registry[agent_type]
                tasks.append((agent_name, agent.execute(request)))
            else:
                logger.warning(f"Agent {agent_name} not registered, skipping")

        results: dict[str, AgentResponse] = {}
        if tasks:
            responses = await asyncio.gather(
                *[t[1] for t in tasks], return_exceptions=True
            )
            for (name, _), response in zip(tasks, responses):
                if isinstance(response, Exception):
                    logger.error(f"Agent {name} failed: {response}")
                    results[name] = AgentResponse(
                        request_id=request.request_id,
                        agent_id=name,
                        result=None,
                        confidence=0.0,
                        reasoning="Agent execution failed",
                        latency_ms=0,
                        fallback_used=True,
                        error=str(response),
                    )
                else:
                    results[name] = response

        logger.info(
            f"Request {request.request_id} completed "
            f"with {len(results)} agent responses"
        )
        return results