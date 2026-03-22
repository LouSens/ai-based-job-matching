# 🤖 KerjaCerdas Intelligence Layer

> **The Multi-Agent Core**

This directory contains the autonomous agents that power the "Smart" in KerjaCerdas. Each agent is specialized for a specific domain and is coordinated by an Orchestrator.

## 🎭 Agent Roster

| Agent | Responsibility | Model / Backend | Logic |
|-------|----------------|-----------------|-------|
| **Orchestrator** | Request routing & SLA monitoring | Gemini 2.0 | Routes via LLM or Rule-based logic |
| **Matching Agent** | Semantic job-skill similarity | IndoBERT | Bi-Encoder retrieval + Cross-Encoder rerank |
| **Skill Gap Agent** | Gap identification & RAG courses | Gemini + RAG | Analyzes seekers vs job requirements |
| **Advisor Agent** | Career counselor & CV tips | Gemini LLM | Conversational AI in Bahasa Indonesia |
| **Data Agent** | Market ingestion & Cleaning | Scheduled Logic | Normalizes BPS & JobStreet data |

## 📐 Design Patterns
- **Protocol Envelopes**: Every agent follows common request/response schemas (SLA, Confidence, Reasoning).
- **Graceful Fallbacks**: Agents operate in "Demo Mode" with high-quality mock data if API limits are reached.
- **Explainability**: Agents return a `reasoning` string explaining their decisions to the user.

## 🧪 Testing
Each agent's logic is validated in `tests/unit/test_api.py` (via API surface) or via direct module imports.

---
<div align="center">
*Built for Hackathon 2026*
</div>
