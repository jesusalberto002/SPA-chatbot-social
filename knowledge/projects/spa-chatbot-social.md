# SPA Chatbot Social

## Overview
SPA Chatbot Social is a full-stack mental health and wellness platform that combines conversational AI, therapist personas, social communities, and subscription-based access control.

The goal is to provide users with a supportive, always-available digital space where they can chat, join topical communities, and access premium experiences while the platform keeps a clear separation between public routes, authenticated routes, and admin controls.

## Problem Statement
Many wellness applications solve only one part of the experience: either one-on-one chat, or community discussion, or subscription monetization. This project intentionally combines those layers in one coherent product so users can move between:
- private assistant conversations
- community content and discussion
- personalized therapist-style interactions
- paid feature tiers

## Current Scope (Implemented)

### 1) Authentication and User Lifecycle
- Account creation, login, and JWT-based authentication
- Password hashing and credential handling via backend middleware
- User profile fields including interests, image URL, and recovery-email flow
- Role model for USER / ADMIN / BOT behavior and route protection

### 2) Conversational AI + Therapist Personas
- Persistent chat sessions and message history
- AI response endpoint for temporary/persistent chat usage
- Therapist persona system with per-therapist provider/voice metadata
- Text + speech support paths using Gemini/Vertex and Deepgram/OpenAI TTS providers

### 3) Community and Social Features
- Community creation, editing, deletion, join/leave
- Post and comment workflows
- Reactions, votes, reporting, and moderation-oriented controls
- Community discovery endpoints (most active / top communities / user feed)

### 4) Subscriptions and Payments
- Tiered subscription model (FREE / BRONZE / PLATINUM)
- Billing-cycle support and status tracking
- Stripe checkout + webhook processing for lifecycle events
- Subscription-aware access rules and upgrade/cancel flows

### 5) Admin and Safety Tooling
- Admin-protected routes
- Reporting dashboards and user management foundations
- Community suspension and moderation primitives

## Architecture Snapshot

### Frontend
- React + Vite SPA
- Route guards for public/protected/admin sections
- Feature surfaces for front page, app experience, community, settings, and presentation card

### Backend
- Node.js + Express API
- Route composition by domain (auth, chat, community, admin, subscriptions, avatars, therapists, tags)
- Prisma ORM with PostgreSQL

### Data Model
- Relational schema for users, sessions, chat messages, subscriptions, communities, posts, comments, votes, reactions, reports
- Extensible model for therapist personas and profile/tag summarization

## Technical Highlights
- Full-stack ownership across product, API, and schema design
- Domain-modeled backend routes with explicit middleware boundaries
- Production-oriented concerns: auth guards, webhook handling, reporting/moderation hooks
- Flexible AI/TTS provider strategy to avoid single-vendor lock-in

## Portfolio RAG Layer (In Progress)
A dedicated portfolio RAG path has been scaffolded under backend `src/rag` and frontend presentation feature APIs.

### Implemented foundation
- Health route for portfolio RAG service
- Embedding service using Gemini text embeddings
- Retrieval service targeting PostgreSQL + pgvector
- End-to-end RAG orchestration function with context assembly
- Schema support for chunk metadata and vector embeddings

### Planned completion
- Ingestion pipeline from `knowledge/` markdown to chunked embeddings
- Source citation rendering in recruiter-facing chat UI
- Retrieval tuning (thresholds, top-k, source filters)
- Better fallback handling for low-confidence contexts

## Multi-Model Orchestration (Planned Next)
The near-term roadmap includes orchestration logic that can route tasks across specialized models.

### Proposed strategy
- Use one fast model for retrieval-grounded Q&A
- Use a higher-reasoning model for complex synthesis or structured outputs
- Use model-specific strengths for tasks like summarization, extraction, and tone-safe response generation
- Add lightweight routing policies based on request type, latency budget, and confidence signals

## MCP Integration (Planned Next)
Model Context Protocol (MCP) is planned to extend the assistant with controlled tool access and richer external context.

### Target outcomes
- Tool-backed assistant actions with auditable boundaries
- Cleaner separation between language generation and operational actions
- Future ability to connect selective data/tool providers without hardcoding every integration into core chat code

## Result
SPA Chatbot Social demonstrates end-to-end product engineering: user auth, payments, AI chat, community systems, moderation workflows, and an evolving RAG architecture designed for recruiter-facing explainability and future multi-model/MCP expansion.
