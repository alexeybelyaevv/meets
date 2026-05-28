# Meets Project Instructions

This is a TypeScript monorepo for Meets, a mobile-first social events app.

Stack:
- Expo mobile app in /mobile
- NestJS API in /backend
- shared TypeScript package in /shared
- pnpm workspaces
- Turborepo

Rules:
- Use TypeScript everywhere.
- Do not import shared via relative paths like ../../shared.
- Always import shared as @meets/shared.
- Keep shared platform-agnostic.
- Do not add business logic unless explicitly asked.
- Do not add auth/events modules yet.
- Do not commit node_modules, .env files, build outputs, or generated native Expo folders.
- Keep the setup minimal and working.
- Prefer simple architecture over overengineering.

Verification:
- Run pnpm install.
- Verify workspace dependencies are linked.
- Verify @meets/shared can be imported in mobile and backend.
- Verify package scripts are valid.
- If something cannot be run in this environment, explain exactly what was not verified.
