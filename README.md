# Portdock CaaS — Container as a Service

> An automated cloud hosting orchestration platform designed to streamline Docker container management and deployment through a clean and intuitive web interface.

<div align="center">

![Status](https://img.shields.io/badge/status-active-brightgreen)
![License](https://img.shields.io/badge/license-MIT-blue)
![NestJS](https://img.shields.io/badge/backend-NestJS%2011-red)
![Next.js](https://img.shields.io/badge/frontend-Next.js%2016-black)
![PostgreSQL](https://img.shields.io/badge/database-PostgreSQL-336791)
![Docker](https://img.shields.io/badge/runtime-Docker-2496ED)

</div>

---

## 📖 Table of Contents

- [Overview](#-overview)
- [Key Features](#-key-features)
- [Tech Stack \& Infrastructure](#-tech-stack--infrastructure)
- [System Architecture](#-system-architecture)
- [Project Structure](#-project-structure)
- [Database Schema](#-database-schema)
- [Prerequisites](#-prerequisites)
- [Getting Started](#-getting-started)
- [Running the Application](#-running-the-application)
- [Environment Variables](#-environment-variables)
- [Production Deployment](#-production-deployment)
- [API Documentation](#-api-documentation)
- [Backend Modules](#-backend-modules)
- [Frontend Pages](#-frontend-pages)
- [Security](#-security)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🌟 Overview

**Portdock CaaS** (Container as a Service) is a self-hosted platform that enables users to deploy, manage, and monitor Docker containers through a clean and intuitive web interface. It is designed to run on a Linux Ubuntu Server (VPS) and leverages the Docker Engine API for container orchestration.

It delivers a deployment experience similar to Heroku or Railway, but runs entirely on your own infrastructure — giving you full control over your data and configuration.

---

## ✨ Key Features

| Feature                     | Description                                                      |
| --------------------------- | ---------------------------------------------------------------- |
| 🚀 **Automated Deployment** | Deploy apps from GitHub repositories, ZIP files, or Dockerfiles  |
| 🐳 **Container Management** | Start, stop, restart, and remove containers effortlessly         |
| 📊 **Real-time Monitoring** | Live CPU, RAM, disk, and network usage metrics                   |
| 🗄️ **Managed Databases**    | Instant provisioning of PostgreSQL, MySQL, Redis, and MongoDB    |
| 💾 **Automated Backups**    | Scheduled and on-demand database backups                         |
| 🔌 **Web Terminal**         | Access container terminals directly in the browser via WebSocket |
| 🌐 **Auto Nginx Config**    | Automatic reverse proxy \& subdomain configuration per project   |
| 🔗 **GitHub Webhooks**      | Auto-deploy on push to GitHub repository                         |
| 📋 **Activity Logs**        | Complete audit trail for all user actions                        |
| 🔐 **Two-Factor Auth**      | TOTP-based login security (Google Authenticator compatible)      |
| 👥 **Multi-user \& Roles**  | User management system with USER and ADMIN roles                 |
| 📧 **Email Notifications**  | Email notifications via Nodemailer                               |
| ⚙️ **System Settings**      | Centralized platform configuration, including timezone           |

---

## 🛠 Tech Stack \& Infrastructure

### Backend

| Technology            | Version | Purpose                                      |
| --------------------- | ------- | -------------------------------------------- |
| **NestJS**            | 11.x    | Primary REST API framework                   |
| **Node.js**           | ≥ 20.x  | JavaScript runtime                           |
| **Prisma ORM**        | 7.x     | Database ORM \& migrations                   |
| **PostgreSQL**        | 15      | Primary database                             |
| **Dockerode**         | 5.x     | Docker Engine API client                     |
| **Socket.IO**         | 4.x     | WebSocket (terminal \& real-time monitoring) |
| **Passport.js + JWT** | —       | Authentication \& authorization              |
| **Speakeasy**         | 2.x     | TOTP for Two-Factor Authentication           |
| **Nodemailer**        | 9.x     | Email delivery                               |
| **Zod**               | 4.x     | Request schema validation                    |
| **Swagger**           | 11.x    | Automatic API documentation                  |
| **Helmet**            | 8.x     | HTTP security headers                        |
| **CSRF-CSRF**         | 4.x     | CSRF protection                              |

### Frontend

| Technology                | Version | Purpose                                    |
| ------------------------- | ------- | ------------------------------------------ |
| **Next.js**               | 16.x    | React framework (App Router)               |
| **React**                 | 19.x    | UI library                                 |
| **TypeScript**            | 5.x     | Static typing                              |
| **Tailwind CSS**          | 4.x     | Utility-first CSS framework                |
| **shadcn/ui**             | —       | UI components built on Radix UI            |
| **TanStack Query**        | 5.x     | Server state management \& caching         |
| **Zustand**               | 5.x     | Client-side state management               |
| **Recharts**              | 3.x     | Charting library for monitoring dashboards |
| **xterm.js**              | 5.x     | Browser-based terminal emulator            |
| **Socket.IO Client**      | 4.x     | WebSocket client                           |
| **React Hook Form + Zod** | —       | Form handling \& validation                |
| **Axios**                 | 1.x     | HTTP client                                |
| **Sonner**                | 2.x     | Toast notifications                        |

### Infrastructure

| Component            | Technology                |
| -------------------- | ------------------------- |
| **Reverse Proxy**    | Nginx                     |
| **SSL/TLS**          | Let'''s Encrypt (Certbot) |
| **Package Manager**  | Bun                       |
| **Target OS**        | Linux Ubuntu Server (VPS) |
| **Containerization** | Docker Engine             |

---

## 🏗 System Architecture

```
                    ┌──────────────────────────────────────┐
                    │           Internet / User             │
                    └──────────────────┬───────────────────┘
                                       │ HTTPS
                    ┌──────────────────▼───────────────────┐
                    │          Nginx (Reverse Proxy)        │
                    │  portdock.my.id | api.portdock.my.id  │
                    └───────┬──────────────────┬────────────┘
                            │                  │
         ┌──────────────────▼───┐  ┌───────────▼─────────────────┐
         │  Frontend (Next.js)  │  │   Backend API (NestJS)       │
         │      Port :3001      │  │       Port :3001             │
         │  - Dashboard UI      │  │  - REST API /api/*           │
         │  - Auth Pages        │  │  - WebSocket (Socket.IO)     │
         │  - Monitoring Charts │  │  - Swagger Docs /api/docs    │
         └──────────────────────┘  └──────────┬──────────────────┘
                                               │
                         ┌─────────────────────┤
                         │                     │
          ┌──────────────▼──────┐  ┌───────────▼─────────────┐
          │  PostgreSQL (DB)    │  │   Docker Engine API      │
          │  Port :5433 (local) │  │  /var/run/docker.sock    │
          └─────────────────────┘  └─────────────────────────┘
```

### Request Flow

1. User visits `https://portdock.my.id` → Nginx forwards to the Next.js frontend (`:3001`)
2. Frontend calls `https://api.portdock.my.id/api/*` → Nginx forwards to the NestJS backend (`:3001`)
3. Backend communicates with PostgreSQL for persistent data storage
4. Backend communicates with the Docker Engine API to manage containers

---

## 📁 Project Structure

```
portdock-caas/
├── frontend/                    # Next.js web application (UI)
│   ├── src/
│   │   ├── app/                 # App Router (Next.js 13+ style)
│   │   │   ├── (auth)/          # Auth pages (login, register, 2FA)
│   │   │   ├── (dashboard)/     # Dashboard pages (protected by auth)
│   │   │   │   ├── dashboard/   # Overview \& statistics
│   │   │   │   ├── projects/    # Project management
│   │   │   │   ├── containers/  # Container management
│   │   │   │   ├── databases/   # Managed databases
│   │   │   │   ├── monitoring/  # System monitoring
│   │   │   │   ├── terminal/    # Web terminal
│   │   │   │   ├── activity-logs/ # Audit logs
│   │   │   │   └── settings/    # Account \& system settings
│   │   │   ├── (admin)/         # Admin panel
│   │   │   ├── about/           # About page
│   │   │   ├── features/        # Features page
│   │   │   └── pricing/         # Pricing page
│   │   ├── components/          # Reusable UI components
│   │   ├── constants/           # Application constants
│   │   ├── hooks/               # Custom React hooks
│   │   ├── i18n/                # Internationalization
│   │   ├── lib/                 # Utilities \& library configurations
│   │   ├── services/            # API service layer (Axios)
│   │   ├── store/               # Zustand global state
│   │   ├── types/               # TypeScript type definitions
│   │   └── utils/               # Utility functions
│   ├── public/                  # Static assets
│   └── package.json
│
├── backend/                     # NestJS REST API server
│   ├── src/
│   │   ├── activity-logs/       # Audit trail module
│   │   ├── admin/               # Admin panel module
│   │   ├── archive/             # ZIP/archive handling module
│   │   ├── auth/                # Authentication \& authorization module
│   │   │   ├── decorators/      # Custom decorators
│   │   │   ├── dto/             # Data Transfer Objects
│   │   │   ├── guards/          # Auth guards (JWT, Local)
│   │   │   ├── interfaces/      # TypeScript interfaces
│   │   │   └── strategies/      # Passport strategies
│   │   ├── backup/              # Data backup module
│   │   ├── containers/          # Docker container management module
│   │   ├── csrf/                # CSRF protection configuration
│   │   ├── databases/           # Managed databases module
│   │   ├── deployments/         # Deployment orchestration module
│   │   ├── docker/              # Docker service wrapper (Dockerode)
│   │   ├── git/                 # Git/GitHub integration module
│   │   ├── mailer/              # Email delivery module
│   │   ├── monitoring/          # System monitoring module
│   │   ├── nginx/               # Automatic Nginx configuration module
│   │   ├── notifications/       # Notifications module
│   │   ├── prisma/              # Prisma service \& module
│   │   ├── projects/            # Project management module
│   │   ├── settings/            # System settings module
│   │   ├── terminal/            # Web terminal module (WebSocket)
│   │   ├── utils/               # Backend utilities
│   │   ├── webhooks/            # GitHub webhooks module
│   │   ├── app.module.ts        # Root application module
│   │   └── main.ts              # Application entry point
│   ├── prisma/
│   │   ├── schema.prisma        # Database schema
│   │   └── migrations/          # Database migrations
│   ├── docker-compose.yml       # Docker config for DB \& Adminer
│   └── package.json
│
├── config/                      # Nginx configuration files
│   ├── api.backend.conf         # Nginx config for the API backend
│   └── web-frontend.conf        # Nginx config for the frontend
│
├── LICENSE
└── README.md
```

---

## 🗄 Database Schema

The platform uses **PostgreSQL** as its primary database with Prisma ORM. The following are the core entities:

| Model             | Description                                                            |
| ----------------- | ---------------------------------------------------------------------- |
| `User`            | User data (email, hashed password, 2FA secret, SSH keys, GitHub token) |
| `Project`         | Deployment project (repo URL, branch, template, domain, env vars)      |
| `Container`       | Docker container linked to a project (image, ports, resource limits)   |
| `Deployment`      | Deployment history (status, progress, commit hash, duration)           |
| `ManagedDatabase` | Platform-provisioned databases (PG, MySQL, Redis, MongoDB)             |
| `DatabaseBackup`  | Managed database backup history                                        |
| `Session`         | Active user login sessions                                             |
| `ActivityLog`     | Audit trail for all user actions                                       |
| `TerminalLog`     | Terminal command history                                               |
| `SystemMetric`    | System metric snapshots (CPU, RAM, disk, network)                      |
| `SystemSetting`   | Platform configuration (key-value store)                               |

### Enums

| Enum              | Values                                                    |
| ----------------- | --------------------------------------------------------- |
| `Role`            | `USER`, `ADMIN`                                           |
| `UserStatus`      | `ACTIVE`, `SUSPENDED`                                     |
| `ProjectStatus`   | `ACTIVE`, `INACTIVE`, `BUILDING`, `FAILED`                |
| `ContainerStatus` | `RUNNING`, `STOPPED`, `BUILDING`, `ERROR`, `REMOVING`     |
| `DeploymentType`  | `ZIP`, `GITHUB`, `DOCKERFILE`                             |
| `AppTemplate`     | `NIXPACKS`, `STATIC_NGINX`, `STATIC_APACHE`, `PHP_APACHE` |
| `DatabaseType`    | `POSTGRESQL`, `MYSQL`, `REDIS`, `MONGODB`                 |

---

## 📋 Prerequisites

Make sure the following software is installed before you begin:

- **[Bun](https://bun.sh/)** `>= 1.0` — Package manager \& runtime
- **[Node.js](https://nodejs.org/)** `>= 20.x` — Required by NestJS
- **[Docker Engine](https://docs.docker.com/engine/install/)** — For container management
- **[PostgreSQL](https://www.postgresql.org/)** `>= 15` — Database (or use the provided Docker Compose)
- **Linux Ubuntu Server** — Recommended deployment target (also works on macOS/WSL for development)

Verify your installations:

```bash
bun --version
node --version
docker --version
psql --version
```

---

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/azrilpramudia/portdock-caas.git
cd portdock-caas
```

### 2. Set Up the Database with Docker

Run PostgreSQL and Adminer using the provided Docker Compose file:

```bash
cd backend

# Copy the environment file
cp .env.example .env

# Edit .env to match your configuration
nano .env

# Start the database
docker compose up -d
```

> **Info:** PostgreSQL will run on port `5433` (host). Adminer is also available for browser-based database management.

### 3. Install Dependencies

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

### 4. Run Database Migrations

```bash
cd backend
bunx prisma migrate dev
```

---

## ▶️ Running the Application

### Backend (NestJS API)

```bash
cd backend

# Development mode (with hot-reload)
bun run start:dev

# Build for production
bun run build

# Production mode
bun run start:prod
```

Backend API available at: `http://localhost:3001`
Swagger UI available at: `http://localhost:3001/api/docs`

### Frontend (Next.js)

```bash
cd frontend

# Development mode
bun run dev

# Production build
bun run build \&\& bun run start
```

Frontend available at: `http://localhost:3000`

> **⚠️ Note:** Make sure the backend is running before starting the frontend, especially in production mode.

### Running Both Simultaneously (Development)

Open two separate terminals:

**Terminal 1 (Backend):**

```bash
cd backend \&\& bun run start:dev
```

**Terminal 2 (Frontend):**

```bash
cd frontend \&\& bun run dev
```

### Other Useful Commands

```bash
# Format code
bun run format

# Lint \& auto-fix
bun run lint

# Run unit tests
bun run test

# Run tests with coverage report
bun run test:cov

# Run end-to-end tests
bun run test:e2e

# Debug mode
bun run start:debug
```

---

## 🔧 Environment Variables

### Backend (`backend/.env`)

Create a `.env` file from the provided template:

```bash
cp backend/.env.example backend/.env
```

| Variable                | Example Value                                    | Description                                     |
| ----------------------- | ------------------------------------------------ | ----------------------------------------------- |
| `DB_USER`               | `portdock_user`                                  | PostgreSQL username                             |
| `DB_PASSWORD`           | `strong_password`                                | PostgreSQL password                             |
| `DB_NAME`               | `portdock`                                       | Database name                                   |
| `DATABASE_URL`          | `postgresql://user:pass@localhost:5433/portdock` | Prisma connection string                        |
| `JWT_SECRET`            | `random-secret-min-32-chars`                     | JWT signing secret (must be strong)             |
| `JWT_EXPIRES_IN`        | `7d`                                             | JWT token expiry duration                       |
| `PORT`                  | `3001`                                           | Backend server port                             |
| `NODE_ENV`              | `development`                                    | Environment (`development` / `production`)      |
| `UPLOAD_DIR`            | `./uploads`                                      | File upload storage directory                   |
| `GITHUB_WEBHOOK_SECRET` | `webhook_secret`                                 | Secret for GitHub Webhook validation            |
| `SWAGGER_USERNAME`      | `admin`                                          | Basic Auth username for Swagger UI (production) |
| `SWAGGER_PASSWORD`      | `portdock-secret-2024`                           | Basic Auth password for Swagger UI (production) |

```env
# ===== Database =====
DB_USER="portdock_user"
DB_PASSWORD="your_strong_password_here"
DB_NAME="portdock"
DATABASE_URL="postgresql://portdock_user:your_strong_password_here@localhost:5433/portdock"

# ===== Authentication =====
JWT_SECRET="your-super-secret-jwt-key-min-32-chars"
JWT_EXPIRES_IN="7d"

# ===== Server =====
PORT=3001
NODE_ENV="development"

# ===== File Upload =====
UPLOAD_DIR="./uploads"

# ===== Webhooks =====
GITHUB_WEBHOOK_SECRET="your_webhook_secret_here"

# ===== Swagger UI (Production) =====
SWAGGER_USERNAME="admin"
SWAGGER_PASSWORD="portdock-secret-2024"
```

### Frontend (`frontend/.env.local`)

Create a `.env.local` file from the provided template:

```bash
cp frontend/.env.example frontend/.env.local
```

| Variable              | Example Value               | Description                                 |
| --------------------- | --------------------------- | ------------------------------------------- |
| `NEXT_PUBLIC_API_URL` | `http://localhost:3001/api` | Backend API URL accessible from the browser |

```env
# Development
NEXT_PUBLIC_API_URL="http://localhost:3001/api"

# Production
# NEXT_PUBLIC_API_URL="https://api.portdock.my.id/api"
```

---

## 🌐 Production Deployment

### 1. Create Docker Network

```bash
docker network create portdock-net
```

### 2. Start the Database

```bash
cd backend
# Ensure NODE_ENV=production in your .env
docker compose up -d
bunx prisma migrate deploy
```

### 3. Configure Nginx

Copy the Nginx config files from the `config/` directory to your server:

```bash
sudo cp config/api.backend.conf /etc/nginx/sites-available/api.portdock.my.id
sudo cp config/web-frontend.conf /etc/nginx/sites-available/portdock.my.id

sudo ln -s /etc/nginx/sites-available/api.portdock.my.id /etc/nginx/sites-enabled/
sudo ln -s /etc/nginx/sites-available/portdock.my.id /etc/nginx/sites-enabled/

sudo nginx -t \&\& sudo systemctl reload nginx
```

### 4. Set Up SSL with Certbot

```bash
sudo apt install certbot python3-certbot-nginx -y
sudo certbot --nginx -d portdock.my.id -d www.portdock.my.id
sudo certbot --nginx -d api.portdock.my.id
```

### 5. Build \& Run with PM2

```bash
# Install PM2 globally
npm install -g pm2

# Backend
cd backend
bun run build
pm2 start dist/main.js --name portdock-backend

# Frontend
cd frontend
bun run build
pm2 start "bun run start" --name portdock-frontend

# Save PM2 process list and enable auto-start on reboot
pm2 save
pm2 startup
```

---

## 📚 API Documentation

Swagger UI is automatically available once the backend is running:

- **Development:** `http://localhost:3001/api/docs`
- **Production:** `https://api.portdock.my.id/api/docs` _(protected by Basic Auth)_

> **🔐 Security:** In production, Swagger UI is protected by HTTP Basic Authentication. Configure `SWAGGER_USERNAME` and `SWAGGER_PASSWORD` in your `.env` file.

### API Authentication

The API uses a combination of:

1. **JWT Cookie** — The token is stored in an `access_token` cookie (HttpOnly, safe from XSS)
2. **CSRF Token** — All mutating requests (POST/PUT/PATCH/DELETE) require the `x-csrf-token` header

All endpoints use the `/api` prefix. Example endpoints:

| Method | Endpoint                    | Description                  |
| ------ | --------------------------- | ---------------------------- |
| `POST` | `/api/auth/login`           | User login                   |
| `POST` | `/api/auth/register`        | Register a new user          |
| `POST` | `/api/auth/logout`          | Logout \& invalidate session |
| `GET`  | `/api/projects`             | List all projects            |
| `POST` | `/api/projects`             | Create a new project         |
| `GET`  | `/api/containers`           | List all containers          |
| `POST` | `/api/containers/:id/start` | Start a container            |
| `POST` | `/api/containers/:id/stop`  | Stop a container             |
| `GET`  | `/api/monitoring/metrics`   | Get real-time system metrics |
| `GET`  | `/api/databases`            | List managed databases       |
| `POST` | `/api/databases`            | Provision a new database     |
| `GET`  | `/api/activity-logs`        | Get activity log history     |

---

## 🧩 Backend Modules

| Module                | Endpoint               | Description                                            |
| --------------------- | ---------------------- | ------------------------------------------------------ |
| `AuthModule`          | `/api/auth/*`          | Login, register, logout, token refresh, 2FA, sessions  |
| `ProjectsModule`      | `/api/projects/*`      | CRUD for deployment projects                           |
| `ContainersModule`    | `/api/containers/*`    | Docker container lifecycle management + WebSocket logs |
| `DeploymentsModule`   | `/api/deployments/*`   | Deployment orchestration (ZIP, GitHub, Dockerfile)     |
| `DatabasesModule`     | `/api/databases/*`     | Managed database provisioning \& management            |
| `MonitoringModule`    | `/api/monitoring/*`    | System metrics (CPU, RAM, disk, network)               |
| `ActivityLogsModule`  | `/api/activity-logs/*` | User action audit trail                                |
| `TerminalModule`      | `ws://…/terminal`      | Web terminal via WebSocket                             |
| `BackupModule`        | `/api/backup/*`        | Database backup \& restore                             |
| `WebhooksModule`      | `/api/webhooks/*`      | GitHub webhook endpoint (auto-deploy)                  |
| `NginxModule`         | `/api/nginx/*`         | Automatic Nginx configuration management               |
| `AdminModule`         | `/api/admin/*`         | Administration panel (ADMIN role only)                 |
| `SettingsModule`      | `/api/settings/*`      | System settings (timezone, etc.)                       |
| `NotificationsModule` | `/api/notifications/*` | User notification management                           |
| `MailerModule`        | _(internal)_           | Email delivery service via Nodemailer                  |
| `GitModule`           | _(internal)_           | Git integration for cloning \& pulling repositories    |
| `ArchiveModule`       | _(internal)_           | ZIP file extraction for deployments                    |
| `DockerModule`        | _(internal)_           | Dockerode wrapper for the Docker Engine API            |

---

## 🖥 Frontend Pages

| Route            | Description                             |
| ---------------- | --------------------------------------- |
| `/`              | Landing page                            |
| `/about`         | About the platform                      |
| `/features`      | Platform features overview              |
| `/pricing`       | Pricing page                            |
| `/login`         | User login                              |
| `/register`      | User registration                       |
| `/dashboard`     | Statistics overview \& platform summary |
| `/projects`      | List \& manage deployment projects      |
| `/containers`    | List \& manage Docker containers        |
| `/databases`     | List \& manage provisioned databases    |
| `/monitoring`    | Real-time system monitoring dashboard   |
| `/terminal`      | Browser-based web terminal (xterm.js)   |
| `/activity-logs` | User activity history                   |
| `/settings`      | Account, profile \& security settings   |

---

## 🔐 Security

The platform implements multiple layers of security:

| Mechanism                  | Implementation                                                           |
| -------------------------- | ------------------------------------------------------------------------ |
| **HTTP Security Headers**  | Helmet.js (XSS, HSTS, Clickjacking protection)                           |
| **CSRF Protection**        | Double-Submit Cookie Pattern (`csrf-csrf`)                               |
| **Rate Limiting**          | ThrottlerModule — 100 requests per 60 seconds per IP                     |
| **Input Validation**       | Zod schema validation on all endpoints                                   |
| **Password Hashing**       | bcrypt with salt rounds                                                  |
| **JWT Authentication**     | HttpOnly cookie (inaccessible to JavaScript)                             |
| **Two-Factor Auth**        | TOTP via speakeasy (Google Authenticator compatible)                     |
| **CORS**                   | Strict domain whitelist in production                                    |
| **Brute-force Protection** | Account lockout after repeated failed login attempts                     |
| **Session Management**     | Active session tracking with per-device revocation                       |
| **Swagger Auth**           | Basic Auth protecting API docs in production                             |
| **Trust Proxy**            | X-Forwarded-For configuration for real client IP behind Nginx/Cloudflare |

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork this repository
2. Create a new feature branch: `git checkout -b feat/your-feature-name`
3. Commit your changes: `git commit -m '''feat: add feature X'''`
4. Push to your branch: `git push origin feat/your-feature-name`
5. Open a Pull Request

### Commit Message Convention

This project follows [Conventional Commits](https://www.conventionalcommits.org/):

| Prefix      | Used for                 |
| ----------- | ------------------------ |
| `feat:`     | A new feature            |
| `fix:`      | A bug fix                |
| `docs:`     | Documentation changes    |
| `chore:`    | Maintenance tasks        |
| `refactor:` | Code refactoring         |
| `perf:`     | Performance improvements |
| `test:`     | Adding or fixing tests   |

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](./LICENSE) file for details.

Copyright © 2026 Meow
