# Soymods site

A modern, blueprint-inspired marketing site for **Soymods** and the **Pathmind** mod. Built without external dependencies to avoid network installs, featuring a lightweight Node server with a GitHub release proxy.

## Getting started

```bash
npm install # no external packages required
npm run dev
```

The site runs at `http://localhost:3000`. Static assets live in `public/`.

## API route
- `GET /api/releases/pathmind` fetches the latest GitHub release and returns `{ version, html_url, jar_url }` with a cached fallback to `v1.0.0` when the API is unavailable.

## Deploying
Any static host with a small Node entry will work. The included `server.js` serves static files and the release API; deploy it on services like Render, Fly.io, or a small VPS. If you serve the site behind another web server, proxy `/api/releases/pathmind` to `server.js` or replace it with your own edge function.

## Branding notes
- Studio: **Soymods** — owned and developed by **ryduzz**.
- Flagship mod: **Pathmind**, a visual node-based automation editor for Minecraft Fabric.
