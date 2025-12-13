-- Enable pgvector extension
create extension if not exists vector;

-- Enums
create type candidate_status as enum ('Screening', 'Technical', 'Technical', 'Assignment ', 'Final HR', 'Offer');
create type job_status as enum ('Open', 'Closed', 'On Hold');
create type activity_type as enum ('upload', 'assignment', 'stage_change', 'rating', 'note');

-- Candidates Table
create table candidates (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  phone text,
  role text,
  skills jsonb default '[]'::jsonb,
  experience integer default 0,
  linkedin text,
  location text,
  resume_url text,
  resume_text text, -- Extracted text for search
  embedding vector(1536), -- For semantic search
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Jobs Table
create table jobs (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  department text not null,
  openings integer default 1,
  status job_status default 'Open',
  skills_required jsonb default '[]'::jsonb,
  description text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Job Candidates Junction Table (Many-to-Many + Stage info)
create table job_candidates (
  id uuid primary key default gen_random_uuid(),
  job_id uuid references jobs(id) on delete cascade not null,
  candidate_id uuid references candidates(id) on delete cascade not null,
  status candidate_status default 'Applied',
  stage_order integer default 0, -- For Kanban ordering within a column
  fit_score float,
  rating integer check (rating >= 1 and rating <= 5),
  rejected_reason text,
  feedback text,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(job_id, candidate_id)
);

-- Timeline Table
create table timeline (
  id uuid primary key default gen_random_uuid(),
  candidate_id uuid references candidates(id) on delete cascade,
  job_id uuid references jobs(id) on delete set null,
  type activity_type not null,
  title text not null,
  description text,
  metadata jsonb default '{}'::jsonb, -- Store extra data like mapped columns, old/new values
  created_at timestamptz default now()
);

-- Indexes
create index candidates_email_idx on candidates(email);
create index candidates_skills_idx on candidates using gin (skills);
create index jobs_status_idx on jobs(status);
create index job_candidates_job_id_idx on job_candidates(job_id);
create index job_candidates_candidate_id_idx on job_candidates(candidate_id);
create index timeline_candidate_id_idx on timeline(candidate_id);

-- HNSW Index for vector search
create index candidates_embedding_idx on candidates using hnsw (embedding vector_cosine_ops);

-- RLS Policies (Enable RLS but allow public access for demo/simplicity as requested, or restrictive)
-- For this "hackathon-style" demo, we will enable RLS but create open policies for anon/authenticated 
-- because backend logic might run client-side or we want easy access.
-- In a real production app, we would restrict this.

alter table candidates enable row level security;
alter table jobs enable row level security;
alter table job_candidates enable row level security;
alter table timeline enable row level security;

-- Candidates policies
create policy "Allow public select candidates" on candidates for select using (true);
create policy "Allow public insert candidates" on candidates for insert with check (true);
create policy "Allow public update candidates" on candidates for update using (true);
create policy "Allow public delete candidates" on candidates for delete using (true);

-- Jobs policies
create policy "Allow public select jobs" on jobs for select using (true);
create policy "Allow public insert jobs" on jobs for insert with check (true);
create policy "Allow public update jobs" on jobs for update using (true);
create policy "Allow public delete jobs" on jobs for delete using (true);

-- Job Candidates policies
create policy "Allow public select job_candidates" on job_candidates for select using (true);
create policy "Allow public insert job_candidates" on job_candidates for insert with check (true);
create policy "Allow public update job_candidates" on job_candidates for update using (true);
create policy "Allow public delete job_candidates" on job_candidates for delete using (true);

-- Timeline policies
create policy "Allow public select timeline" on timeline for select using (true);
create policy "Allow public insert timeline" on timeline for insert with check (true);
create policy "Allow public update timeline" on timeline for update using (true);
create policy "Allow public delete timeline" on timeline for delete using (true);

-- Storage bucket setup (script to be run in SQL editor)
insert into storage.buckets (id, name, public) 
values ('resumes', 'resumes', true)
on conflict (id) do nothing;

create policy "Public Access" on storage.objects for select using ( bucket_id = 'resumes' );
create policy "Public Upload" on storage.objects for insert with check ( bucket_id = 'resumes' );
