# APMA — Autonomous Product Manager Agent

APMA is a premium, state-of-the-art AI-powered workspace designed to streamline product discovery. By reading reference documentation, performing deep web research, and executing self-correcting agent chains, APMA generates production-ready PRDs, roadmaps, and briefs in minutes.

---

## 🚀 Key Features

* **Autonomous Graph Planning:** Breaks goals down into a tree of sub-tasks and schedules them dynamically.
* **Smart Document RAG:** Upload PDF, DOCX, or CSV files to automatically chunk, embed, and store them for semantic retrieval.
* **Real-Time Web Research:** Integrates Tavily search to fetch benchmarks, industry facts, and up-to-date data.
* **Strict Quality Guardrails:** Confidence scoring checks and quality constraints prevent LLM hallucinations.
* **Secure OTP Verification:** Two-step account registration and login verification using 6-digit one-time passcodes sent via email.
* **Clean UI Design:** A spacious, minimalist workspace complete with stats, instant search, loading skeletons, and a live agent stream.
* **Multi-Format Exports:** Export finalized specs as structured Markdown (.md), copy them directly, or print/save them as formatted PDF documents.

---

## 🏗️ Architecture Summary

APMA is built as a multi-service containerized application:

```
                  ┌───────────────────────┐
                  │   React Frontend      │ (Vite / Tailwind)
                  └──────────┬────────────┘
                             │ (Port 5173 / Proxy)
                  ┌──────────▼────────────┐
                  │   Express API Server  │ (Node.js / Prisma)
                  └────┬──────────────┬───┘
                       │              │
        ┌──────────────▼──┐        ┌──▼───────────────┐
        │ PostgreSQL DB   │        │ Python AI Agent  │ (Flask / LangGraph)
        └─────────────────┘        └──────┬──────┬────┘
                                          │      │
                           ┌──────────────▼─┐  ┌─▼──────────────┐
                           │ Qdrant Vector  │  │ Tavily Web API │
                           │ Database       │  │ (Search)       │
                           └────────────────┘  └────────────────┘
```

1. **Frontend (`/frontend`):** React SPA utilizing Zustand for authentication state and Axios for communications.
2. **Backend API (`/express-api`):** Express server managing user authentication, OTP verification, project databases, and document uploads.
3. **Agent Service (`/python-ai`):** Flask server running LangGraph agent chains (Planner Node ➔ Researcher Node ➔ Analyzer Node ➔ Generator Node).

---

## 🔐 Authentication & OTP Verification Flow

APMA implements a secure two-step authentication system for user onboarding and verification:

1. **User Registration:** Users register with their email and password. This creates a pending user record in PostgreSQL.
2. **OTP Dispatch:** The backend automatically generates a secure 6-digit one-time passcode (OTP) and sends it to the user's registered email using **Resend** (requires setting the `RESEND_API_KEY` in your `.env` configuration).
3. **Verification Page:** Upon submission of the registration form, the user is redirected to the Clean UI OTP verification page to enter their code.
4. **Token Issuance:** Once the OTP is successfully validated against the backend, the account is activated, and JWT `accessToken` and `refreshToken` payloads are stored securely to log the user in automatically.

---

## 🛠️ Local Setup (Docker Compose)

### 1. Prerequisites
Ensure you have **Docker Desktop** installed and running on your system.

### 2. Configure Environment Variables
Copy the template file in the root directory to create your `.env` configuration:
```bash
cp .env.example .env
```
Open `.env` and fill in the necessary keys:
* `DATABASE_URL`: Setup automatically for PostgreSQL.
* `JWT_SECRET` & `JWT_REFRESH_SECRET`: Secure strings of your choice.
* `GROQ_API_KEY`: Required for LLM agent operations.
* `TAVILY_API_KEY`: Required for web-search capabilities.

### 3. Launch Services
Run the Docker Compose stack in detached mode:
```bash
docker-compose up -d --build
```
*Note: The backend Express API service exposes port `3500` to the host instead of `3001` to bypass Windows NAT/Hyper-V network port range exclusions.*

### 4. Access APMA
Once the build completes successfully, open your browser and navigate to:
* **Frontend Workspace:** [http://localhost:5173](http://localhost:5173)
* **Backend API Docs/Health:** [http://localhost:3500/health](http://localhost:3500/health)

---

## 📂 Project Structure

```
apma/
├── docker-compose.yml     # Service definitions (DB, Qdrant, API, AI, Frontend)
├── .env.example           # Shared environment configurations
├── frontend/              # React (Vite) client code
│   ├── src/pages/         # Landing page, Dashboard, and Auth routes
│   └── src/components/    # PRDViewer, SSEViewer, and Navbar components
├── express-api/           # Express server with Prisma ORM
│   ├── src/controllers/   # Request handlers
│   └── prisma/            # PostgreSQL database schema
└── python-ai/             # LangGraph agent service
    ├── app/agents/graph.py# LangGraph node execution flow config
    └── app/rag/           # Parser, chunker, and embedder modules
```

---

## 📄 License
APMA is built for modern product management teams. Distributed under the MIT License.
