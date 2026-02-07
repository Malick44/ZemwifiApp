# GitHub Copilot Instructions

The following rules and context should be applied to all code generation and assistance in this workspace.

## Database Constants (`constants/db.ts`)
**CRITICAL RULE:** Never hardcode database table names, column names, RPC functions, or Enums.
- **ALWAYS** import and use the constants defined in `constants/db.ts`.
- **Example:** Use `TABLES.PROFILES` instead of `'profiles'`.
- **Example:** Use `COLUMNS.PROFILES.PHONE` instead of `'phone'`.
- **Example:** Use `RPC.NEARBY_HOTSPOTS` instead of `'nearby_hotspots'`.

## Project Structure
- **Frontend:** Expo (React Native) with TypeScript.
- **Backend:** Supabase (PostgreSQL + Edge Functions).
- **Navigation:** Expo Router (file-based routing in `app/`).
- **State Management:** Zustand (stores in `src/stores/`).

## Coding Standards
- Use TypeScript for all new files.
- Prefer functional components with Hooks.
- Use `lucide-react-native` for icons.
- Follow the "Container/Presenter" pattern where complex logic resides in hooks or stores.
