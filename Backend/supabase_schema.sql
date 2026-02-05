-- AI Vet Chart (Demo) - Supabase schema

create table if not exists public.animals (
  id text primary key,
  microchip_number text not null,
  name text not null,
  farm_id text,
  age integer,
  sex text,
  breed text,
  thumbnail_url text,
  created_at timestamptz default now()
);

create table if not exists public.records (
  id text primary key,
  animal_id text not null references public.animals(id) on delete cascade,
  visit_date text,
  soap jsonb,
  medication_history text[],
  next_visit_date text,
  next_visit_time text,
  images text[],
  audio_url text,
  doctor text,
  nosai_points integer,
  external_case_id text,
  external_ref_url text,
  medications jsonb,
  created_at timestamptz default now()
);

create index if not exists records_animal_id_idx on public.records (animal_id);
