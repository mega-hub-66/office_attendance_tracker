# Office Days Tracker

## Overview

A Progressive Web Application (PWA) for tracking office attendance and meeting quarterly targets. Users can log daily attendance (office) and view progress against quarterly goals. Built mobile-first with offline support and an iOS-like UI.

## Tech Stack

- Frontend: React + TypeScript, Vite, Tailwind CSS, Radix UI (shadcn/ui)
- Routing: Wouter
- Data fetching: TanStack Query
- Backend: Express (Node.js)
- Shared types: Drizzle ORM + Zod

## Getting Started (Local Dev)

Prerequisites:
- Node.js 18+ (20 recommended)
- npm 9+

Install and run:

```bash
npm install
npm run dev
```

Open http://localhost:5000

Environment:
- The server listens on `process.env.PORT` (defaults to 5000) and `0.0.0.0`.
- No database setup required by default; an in-memory storage is used.

## Production Build & Run

```bash
npm run build
npm start
```

This builds the client into `dist/public` and runs the API + static assets from a single Express server.

## Deployment

The app is a single Node.js service. Any platform that runs Node can host it:
- Set `PORT` in the environment if required by your platform
- Start with `npm start`

Optional: If you later integrate a real Postgres database, set `DATABASE_URL` and use `npm run db:push` to apply the schema with Drizzle.

## Project Structure

- `client/` — React app
- `server/` — Express HTTP server and Vite dev middleware
- `shared/` — Shared schema and types
- `dist/` — Production build output


