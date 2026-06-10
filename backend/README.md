# 🛠️ Portdock CaaS — Backend

> NestJS REST API server for the Portdock CaaS platform. Handles container orchestration, Docker Engine API integration, and exposes RESTful endpoints consumed by the frontend.

---

## 📖 Table of Contents

- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Running the Server](#running-the-server)
- [Project Structure](#project-structure)
- [API Overview](#api-overview)
- [Environment Variables](#environment-variables)
- [Testing](#testing)
- [License](#license)

---

## Tech Stack

| Technology | Version | Purpose |
|---|---|---|
| **NestJS** | ^11.0 | Backend framework |
| **Node.js** | >= 20.x | Runtime environment |
| **TypeScript** | ^5.7 | Type-safe development |
| **Bun** | >= 1.0 | Package manager & runner |
| **Docker Engine API** | — | Container orchestration |

---

## Prerequisites

- **[Bun](https://bun.sh/)** `>= 1.0`
- **[Node.js](https://nodejs.org/)** `>= 20.x`
- **[Docker Engine](https://docs.docker.com/engine/install/)** running on the host machine

---

## Installation

```bash
# From the backend directory
bun install
```

---

## Running the Server

```bash
# Development mode (with hot-reload)
bun run start:dev

# Standard development mode
bun run start

# Debug mode (with inspector)
bun run start:debug

# Production mode
bun run start:prod
```

The server will start on port `3000` by default (configurable via `PORT` env variable).

---

## Project Structure

```
backend/
├── src/
│   ├── app.module.ts       # Root application module
│   ├── app.controller.ts   # Root controller (health check)
│   ├── app.service.ts      # Root service
│   └── main.ts             # Application entry point
├── test/
│   └── app.e2e-spec.ts     # End-to-end tests
├── nest-cli.json           # NestJS CLI configuration
├── tsconfig.json           # TypeScript configuration
├── tsconfig.build.json     # TypeScript build configuration
└── package.json
```

---

## API Overview

> **Note:** The API is currently in early development. Endpoints below reflect the planned architecture.

### Base

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/` | Health check — returns server status |

### Containers _(coming soon)_

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/containers` | List all containers |
| `POST` | `/containers` | Create & deploy a new container |
| `GET` | `/containers/:id` | Get container details |
| `PATCH` | `/containers/:id` | Update container configuration |
| `DELETE` | `/containers/:id` | Remove a container |
| `POST` | `/containers/:id/start` | Start a container |
| `POST` | `/containers/:id/stop` | Stop a container |
| `POST` | `/containers/:id/restart` | Restart a container |
| `GET` | `/containers/:id/logs` | Stream container logs |

---

## Environment Variables

Create a `.env` file in the `backend/` directory:

```env
# Server Configuration
PORT=3000

# Docker Configuration
DOCKER_SOCKET=/var/run/docker.sock
```

---

## Testing

```bash
# Unit tests
bun run test

# Unit tests in watch mode
bun run test:watch

# End-to-end tests
bun run test:e2e

# Test coverage report
bun run test:cov
```

---

## License

This project is licensed under the **MIT License** — see the root [LICENSE](../LICENSE) file for details.
