# Meets

Meets is a mobile-first social events app for discovering and joining simple local meetups.

## Repository Structure

- `mobile/` - Expo mobile app
- `backend/` - NestJS API
- `shared/` - platform-agnostic TypeScript types shared by mobile and backend

## Requirements

- Node.js
- pnpm

Do not store this project in Desktop, iCloud Drive, or other synced folders. Expo and package managers can behave poorly when project files are continuously synced.

## Install

```sh
pnpm install
```

## Run

```sh
pnpm mobile
pnpm backend
pnpm dev
```

`pnpm mobile` starts the Expo app. `pnpm backend` starts the NestJS API in watch mode. `pnpm dev` runs workspace dev tasks through Turborepo.

## Shared Package

Import shared types through the workspace package:

```ts
import type { EventDto, AuthProvider } from "@meets/shared";
```

Do not import shared code via relative paths such as `../../shared/src`.
