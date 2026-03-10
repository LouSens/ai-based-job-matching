"""
KerjaCerdas - Orchestrator Agent
=================================
Master coordinator for all KerjaCerdas AI agents.
Routes requests, manages agent lifecycle, and aggregates results.

ANTIGRAVITY PROTOCOL: orchestrator | Model: Claude Sonnet | Latency SLA: <500ms
"""
from __future__ import annotations

import asyncio
import logging
import time
import uuid
from dataclasses import dataclass, field
from enum import Enum
from typing import Any

import anthropic

logger = logging.getLogger(__name__)


class AgentType(str, Enum):
    MATCHING = "matching_agent"
    SKILL_GAP = "skill_gap_agent"
    ADVISOR = "advisor_agent"
    DATA = "data_agent"


@dataclass
class AgentRequest:
    """Standardized request envelope for all agent calls."""
    request_id: str = field(default_factory=lambda: str(uuid.uuid4()))
    agent_id: str = ""
    timestamp: float = field(default_factory=time.time)
    payload: dict[str, Any] = field(default_factory=dict)
    user_id: str = ""
    session_id: str = ""


@dataclass
class AgentResponse:
    """Standardized response envelope from all agent calls."""
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
    - Ambiguous → LLM routing decision
    """

    ROUTING_SYSTEM_PROMPT = """You are the routing brain of KerjaCerdas, Indonesia's AI job matching platform.
    
    Given a user message, decide which agent(s) to invoke:
    - matching_agent: User wants job recommendations or matching
    - skill_gap_agent: User wants to know what skills they're missing
    - advisor_agent: User wants career advice or path guidance
    
    Respond ONLY with JSON: {"agents": ["agent_name"], "reasoning": "brief reason"}
    Language: Bahasa Indonesia."""

    def __init__(self, api_key: str | None = None):
        """Initialize orchestrator with Anthropic client."""
        self.client = anthropic.Anthropic(api_key=api_key)
        self.model = "claude-sonnet-4-20250514"
        self._agent_registry: dict[AgentType, Any] = {}

    def register_agent(self, agent_type: AgentType, agent_instance: Any) -> None:
        """Register an agent instance for routing."""
        self._agent_registry[agent_type] = agent_instance
        logger.info(f"Registered agent: {agent_type.value}")

    async def route(self, request: AgentRequest) -> list[str]:
        """
        Use LLM to determine which agents to invoke.

        Args:
            request: Standardized agent request with user payload

        Returns:
            List of agent type names to invoke
        """
        user_message = request.payload.get("message", "")

        response = self.client.messages.create(
            model=self.model,
            max_tokens=200,
            system=self.ROUTING_SYSTEM_PROMPT,
            messages=[{"role": "user", "content": user_message}]
        )

        import json
        try:
            routing = json.loads(response.content[0].text)
            return routing.get("agents", ["matching_agent"])
        except (json.JSONDecodeError, KeyError, IndexError):
            logger.warning(f"Routing parse failed for request {request.request_id}, defaulting to matching")
            return ["matching_agent"]

    async def process(self, user_message: str, user_profile: dict,
                      session_id: str = "") -> dict[str, AgentResponse]:
        """
        Main entry point: process a user request through the agent pipeline.

        Args:
            user_message: Natural language input from user
            user_profile: Seeker profile dict
            session_id: Optional session ID for tracking

        Returns:
            Dict of agent_name → AgentResponse
        """
        request = AgentRequest(
            agent_id="orchestrator",
            payload={"message": user_message, "profile": user_profile},
            session_id=session_id
        )

        logger.info(f"Processing request {request.request_id}: {user_message[:50]}...")

        # Route to appropriate agents
        target_agents = await self.route(request)

        # Execute agents (parallel where possible)
        tasks = []
        for agent_name in target_agents:
            agent_type = AgentType(agent_name)
            if agent_type in self._agent_registry:
                agent = self._agent_registry[agent_type]
                tasks.append((agent_name, agent.execute(request)))
            else:
                logger.warning(f"Agent {agent_name} not registered, skipping")

        results = {}
        if tasks:
            responses = await asyncio.gather(*[t[1] for t in tasks], return_exceptions=True)
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
                        error=str(response)
                    )
                else:
                    results[name] = response

        logger.info(f"Request {request.request_id} completed with {len(results)} agent responses")
        return results