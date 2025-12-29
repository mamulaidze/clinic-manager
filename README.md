# Clinic Manager Dashboard

Production-ready internal dashboard for clinic managers to track clients, payments, and procedure/material usage.

## Stack
- React + TypeScript + Vite
- Tailwind CSS + shadcn/ui
- TanStack Table + React Query
- React Hook Form + Zod
- Supabase (Auth + Database)
- jsPDF + jspdf-autotable

## Setup

### 1) Install
```bash
npm install
```

### 2) Environment
Create `.env` in the project root:
```
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
```

### 3) Supabase SQL
Run in Supabase SQL editor:
```sql
create extension if not exists "uuid-ossp";

create table if not exists public.clinic_records (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  surname text not null,
  mobile text not null,
  date date not null,
  money numeric not null check (money >= 0),
  keramika integer not null default 0,
  tsirkoni integer not null default 0,
  balka integer not null default 0,
  plastmassi integer not null default 0,
  shabloni integer not null default 0,
  cisferi_plastmassi integer not null default 0,
  notes text null,
  created_at timestamptz not null default now()
);

alter table public.clinic_records enable row level security;

create policy "Users can view their own records"
  on public.clinic_records
  for select
  using (auth.uid() = user_id);

create policy "Users can insert their own records"
  on public.clinic_records
  for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own records"
  on public.clinic_records
  for update
  using (auth.uid() = user_id);

create policy "Users can delete their own records"
  on public.clinic_records
  for delete
  using (auth.uid() = user_id);
```

### 4) Create a manager user
- In Supabase Auth, create a user with email + password, or register from the `/login` screen.
- RLS ensures each manager only sees their own data.

### 5) Run
```bash
npm run dev
```

## Notes
- Data is scoped per authenticated user via `user_id` + RLS.
- Use the Dashboard to add, edit, delete, filter, and export records.# clinic-manager
