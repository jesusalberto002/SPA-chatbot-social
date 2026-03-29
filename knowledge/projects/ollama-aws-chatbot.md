# Ollama AWS Chatbot

## Overview
Ollama AWS Chatbot is a containerized full-stack application for secure, document-grounded LLM interactions. It combines user authentication, a real-time chat interface, and a dedicated Retrieval-Augmented Generation (RAG) pipeline so users can query their own documents with context-aware responses.

The project demonstrates an end-to-end AI-native workflow: secure onboarding, document ingestion, vector retrieval, and grounded answer generation.

## Problem Statement
Standard AI chat tools often fail to provide private, document-specific intelligence with enterprise-grade reliability. This project addresses that gap by combining:
- **Identity management** for secure registration and login
- **Knowledge isolation** so each user queries their own document set
- **Operational consistency** through containerized services and cloud-ready deployment patterns

## Current Scope (Implemented)

### 1) Authentication and Identity
- AWS Cognito integration for user pools and secure identity handling
- Protected frontend routes for chat and document features
- Token-based session flow between React frontend and FastAPI backend

### 2) RAG Pipeline and Document Intelligence
- Document upload and preprocessing pipeline for searchable knowledge
- Vector storage using PostgreSQL + pgvector (with support paths for Pinecone or Milvus)
- Retrieval layer that selects the most relevant chunks before generation

### 3) Conversational AI Interface
- Multi-model support via Gemini API and local Ollama-hosted models
- Streaming response support for low-latency chat UX
- Session-aware history persistence for continuity across interactions

### 4) DevOps and Scalability
- Full Dockerization of frontend, backend, and data services
- `docker-compose` orchestration for local/remote environment parity
- FastAPI backend optimized for asynchronous AI task execution

## Architecture Snapshot

### Frontend
- React.js for modular chat and document management UI
- Axios for standardized API communication
- Scoped styling for a modern SPA experience

### Backend
- Python + FastAPI for orchestration and API endpoints
- LangChain / LangGraph for agentic workflow coordination and RAG flow control
- Structured persistence via relational data layer (e.g., SQLAlchemy/Prisma patterns)

### Data Model
- **Relational data:** users, chat sessions, document metadata
- **Vector data:** embeddings representing semantic meaning of uploaded documents

## Technical Highlights
- **AI-native delivery:** accelerated implementation with Cursor and GitHub Copilot
- **Hybrid model strategy:** switch between cloud and local LLMs based on privacy, performance, and cost
- **Cloud readiness:** designed for AWS deployment (EC2/Ubuntu) with production-oriented security and operations patterns

## RAG Layer Notes
- Embedding, chunking, and retrieval are designed to maximize answer grounding
- Retrieval-first prompt assembly reduces hallucinations and improves factual precision
- Architecture supports future extensions like source citation scoring and reranking

## Multi-Model Orchestration (Near-Term)
Planned upgrades include richer orchestration logic to route tasks by model capability:
- fast model for short Q&A and retrieval-grounded responses
- deeper-reasoning model for synthesis-heavy prompts
- policy-based routing using latency and confidence signals

## MCP Integration (Planned)
Model Context Protocol (MCP) is planned to provide controlled tool/data access:
- standardized interfaces for external context providers
- cleaner separation between generation and tool execution
- auditability and safer expansion of assistant capabilities

## Result
This project is a strong example of modern AI application engineering: secure user identity, robust RAG foundations, hybrid model support, and cloud-native deployment practices in one cohesive product.
