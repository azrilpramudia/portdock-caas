# 🐳 Portdock CaaS — Container as a Service

> An automated cloud hosting orchestration platform designed to streamline Docker container management and deployment through an intuitive user interface.

---

## 📖 Table of Contents

- [Overview](#overview)
- [Tech Stack & Infrastructure](#tech-stack--infrastructure)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Getting Started](#getting-started)
- [Running the Application](#running-the-application)
- [Environment Variables](#environment-variables)
- [License](#license)

---

## Overview

**Portdock CaaS** (Container as a Service) is a self-hosted platform that enables users to deploy, manage, and monitor Docker containers through a clean and intuitive web interface. It is designed to run on a Linux Ubuntu Server (VPS) and leverages the Docker Engine API for container orchestration.

Key capabilities:
- 🚀 Deploy Docker containers with ease via a web UI
- 📊 Monitor running containers and their resource usage
- 🔧 Manage container lifecycle (start, stop, restart, remove)
- 🌐 Cloud-ready deployment targeting Linux VPS environments

---

## Tech Stack & Infrastructure

| Layer | Technology |
|---|---|
| **Frontend** | Next.js 16 (TypeScript) + Tailwind CSS v4 |
| **Backend** | NestJS 11 + Node.js |
| **Package Manager** | Bun |
| **Containerization** | Docker Engine API + Docker Containers |
| **Target OS** | Linux Ubuntu Server (VPS) |

---

## Project Structure

```
portdock-caas/
├── frontend/          # Next.js web application (UI)
│   ├── app/           # App Router pages and layouts
│   ├── public/        # Static assets
│   └── ...
├── backend/           # NestJS REST API server
│   ├── src/           # Application source code
│   │   ├── app.module.ts
│   │   ├── app.controller.ts
│   │   ├── app.service.ts
│   │   └── main.ts
│   └── ...
├── LICENSE
└── README.md
```

---

## Prerequisites

Make sure the following are installed on your system before proceeding:

- **[Bun](https://bun.sh/)** `>= 1.0` — Package manager & runtime
- **[Node.js](https://nodejs.org/)** `>= 20.x` — Required by NestJS
- **[Docker Engine](https://docs.docker.com/engine/install/)** — For container management
- **Linux Ubuntu Server** — Recommended deployment target (also works on macOS/WSL for development)

To verify installations:
```bash
bun --version
node --version
docker --version
```

---

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/azrilpramudia/portdock-caas.git
cd portdock-caas
```

### 2. Install dependencies

**Backend:**
```bash
cd backend
bun install
```

**Frontend:**
```bash
cd frontend
bun install
```

---

## Running the Application

### Backend (NestJS API)

```bash
cd backend

# Development mode (watch)
bun run start:dev

# Production mode
bun run start:prod
```

The backend API will be available at: `http://localhost:3000`

### Frontend (Next.js)

```bash
cd frontend

# Development mode
bun run dev

# Production build
bun run build && bun run start
```

The frontend will be available at: `http://localhost:3001`

> **Note:** Make sure the backend is running before starting the frontend in production.

---

## Environment Variables

### Backend (`backend/.env`)

Create a `.env` file inside the `backend/` directory:

```env
# Server
PORT=3000

# Docker
DOCKER_SOCKET=/var/run/docker.sock
```

### Frontend (`frontend/.env.local`)

Create a `.env.local` file inside the `frontend/` directory:

```env
# Backend API URL
NEXT_PUBLIC_API_URL=http://localhost:3000
```

---

## License

This project is licensed under the **MIT License** — see the [LICENSE](./LICENSE) file for details.

Copyright © 2026 meow
