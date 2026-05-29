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

## Auth

Meets uses first-party social authentication. The mobile app obtains provider credentials from Apple, Google, or Telegram and sends them to the NestJS backend. The backend verifies the provider credential, finds or creates an internal `User`, links the provider identity through `SocialAccount`, and issues Meets access and refresh JWTs.

This project does not use Supabase, Firebase Auth, Clerk, Auth0, NextAuth, or another hosted auth provider. Provider secrets stay on the backend only.

The backend stores:

- `User` for the internal account.
- `SocialAccount` for linked Apple, Google, and Telegram identities.
- `RefreshToken` for hashed refresh tokens.

A user can have multiple `SocialAccount` rows linked to one `User`, but only one account per provider for now.

### Apple Setup

1. Use an Apple Developer account.
2. Configure Bundle ID `com.qualeed.meets`.
3. Enable the Sign in with Apple capability.
4. Set `APPLE_BUNDLE_ID` and `APPLE_CLIENT_ID` in backend env.

Apple login works on iOS. Production and development builds need proper Apple Developer capability setup.

### Google Setup

1. Create a Google Cloud project.
2. Create an iOS client ID.
3. Create a Web client ID.
4. Set `EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID` and `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID` in mobile env.
5. Set `GOOGLE_IOS_CLIENT_ID` and `GOOGLE_WEB_CLIENT_ID` in backend env.
6. Use a development build.

Native Google Sign-In requires a development build and does not run in Expo Go.

### Telegram Setup

1. Create a bot via `@BotFather`.
2. Configure Telegram Web Login allowed URLs.
3. Put `TELEGRAM_BOT_TOKEN` into backend env only.
4. Never expose the bot token to mobile.
5. Finish the redirect flow when the production domain and app deep link exist.

The backend already exposes `POST /auth/telegram` for verified Telegram login payloads. The mobile app currently opens `EXPO_PUBLIC_TELEGRAM_LOGIN_URL` or `${EXPO_PUBLIC_API_URL}/auth/telegram/start` as the redirect-flow integration point.
