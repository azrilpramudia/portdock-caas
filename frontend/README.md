# 🎨 Portdock CaaS — Frontend

> Next.js web application for the Portdock CaaS platform. Provides an intuitive user interface for managing and deploying Docker containers through the Portdock backend API.

---

## 📖 Table of Contents

- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Running the App](#running-the-app)
- [Project Structure](#project-structure)
- [Environment Variables](#environment-variables)
- [Building for Production](#building-for-production)
- [License](#license)

---

## Tech Stack

| Technology | Version | Purpose |
|---|---|---|
| **Next.js** | 16.x | React framework (App Router) |
| **React** | 19.x | UI library |
| **TypeScript** | ^5.x | Type-safe development |
| **Tailwind CSS** | ^4.x | Utility-first CSS framework |
| **Bun** | >= 1.0 | Package manager & runner |

---

## Prerequisites

- **[Bun](https://bun.sh/)** `>= 1.0`
- **[Node.js](https://nodejs.org/)** `>= 20.x`
- Portdock **backend** running (see [backend README](../backend/README.md))

---

## Installation

```bash
# From the frontend directory
bun install
```

---

## Running the App

```bash
# Development mode (with hot-reload)
bun run dev
```

Open [http://localhost:3001](http://localhost:3001) in your browser to view the app.

> **Tip:** The page auto-updates as you edit source files. Start with `app/page.tsx`.

---

## Project Structure

```
frontend/
├── app/
│   ├── layout.tsx        # Root layout (fonts, global metadata)
│   ├── page.tsx          # Home page
│   └── globals.css       # Global styles
├── public/               # Static assets (images, icons, etc.)
├── next.config.ts        # Next.js configuration
├── postcss.config.mjs    # PostCSS configuration (Tailwind CSS)
├── tsconfig.json         # TypeScript configuration
└── package.json
```

---

## Environment Variables

Create a `.env.local` file in the `frontend/` directory:

```env
# Backend API base URL
NEXT_PUBLIC_API_URL=http://localhost:3000
```

> Environment variables prefixed with `NEXT_PUBLIC_` are exposed to the browser.

---

## Building for Production

```bash
# Build the production bundle
bun run build

# Start the production server
bun run start
```

The production build output will be in the `.next/` directory.

---

## License

This project is licensed under the **MIT License** — see the root [LICENSE](../LICENSE) file for details.
