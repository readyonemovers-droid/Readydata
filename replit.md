# Workspace

## Overview

pnpm workspace monorepo using TypeScript. Employee registration and admin management portal backed by Supabase.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: Supabase (PostgreSQL)
- **Frontend**: React + Vite + Tailwind CSS
- **Validation**: Zod, react-hook-form
- **Build**: esbuild (CJS bundle)

## Artifacts

- **employee-portal** (`/`) — Employee registration multi-step form + Admin dashboard
  - `/` — Employee registration (5-step form)
  - `/admin` — Admin login
  - `/admin/dashboard` — Admin dashboard (requires auth)
- **api-server** (`/api`) — Shared Express API server

## Supabase Setup Required

Before the app works fully, set up Supabase:

### Database Table (`employees`):
```sql
create table employees (
  id uuid default gen_random_uuid() primary key,
  first_name text not null,
  second_name text not null,
  third_name text not null,
  full_name_id text not null,
  phone text not null,
  skills text,
  profile_photo_url text,
  id_front_url text,
  id_back_url text,
  created_at timestamptz default now()
);
```

### RLS Policies:
```sql
alter table employees enable row level security;
-- Allow anyone to insert (employee registration)
create policy "Allow insert" on employees for insert with check (true);
-- Allow authenticated users to read (admin)
create policy "Allow admin read" on employees for select using (auth.role() = 'authenticated');
```

### Storage Buckets:
- `profile-photos` (public)
- `id-front` (public)
- `id-back` (public)

### Admin Auth:
Create user in Supabase Auth: `lestaz@gmail.com` / `lestaz`

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/employee-portal run dev` — run frontend locally
- `pnpm --filter @workspace/api-server run dev` — run API server locally
