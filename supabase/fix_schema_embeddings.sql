-- Enable pgvector (should be on, but ensuring)
create extension if not exists vector;

-- FIX 1: Add missing embedding column to jobs table
-- We check if it exists first to avoid errors, or just try to add it.
-- Safer to use DO block or just try adding it.
alter table jobs add column if not exists embedding vector(768);

-- FIX 2: Correct candidates embedding dimension (1536 -> 768)
-- The user reported "expected 1536 dimensions", implying the column is currently 1536.
-- We need it to be 768 for Gemini text-embedding-004.
-- Since data is likely invalid or missing, we will DROP and ADD to be safe.
alter table candidates drop column if exists embedding;
alter table candidates add column embedding vector(768);

-- Re-create indexes (since we dropped the column or added new one)
drop index if exists candidates_embedding_idx;
drop index if exists jobs_embedding_idx;
create index candidates_embedding_idx on candidates using hnsw (embedding vector_cosine_ops);
create index jobs_embedding_idx on jobs using hnsw (embedding vector_cosine_ops);

-- Update match_candidates function definition to ensure it uses 768
create or replace function match_candidates(
  query_embedding text,
  match_threshold float,
  match_count int
)
returns table (
  candidate jsonb,
  similarity float
)
language plpgsql
as $$
declare
  query_vec vector(768);
begin
  query_vec := query_embedding::vector(768);
  return query
  select
    to_jsonb(c.*) as candidate,
    1 - (c.embedding <=> query_vec) as similarity
  from candidates c
  where c.embedding is not null
    and 1 - (c.embedding <=> query_vec) > match_threshold
  order by c.embedding <=> query_vec
  limit match_count;
end;
$$;

-- Update match_jobs function definition to ensure it uses 768
create or replace function match_jobs(
  query_embedding text,
  match_threshold float,
  match_count int
)
returns table (
  job jsonb,
  similarity float
)
language plpgsql
as $$
declare
  query_vec vector(768);
begin
  query_vec := query_embedding::vector(768);
  return query
  select
    to_jsonb(j.*) as job,
    1 - (j.embedding <=> query_vec) as similarity
  from jobs j
  where j.embedding is not null
    and 1 - (j.embedding <=> query_vec) > match_threshold
  order by j.embedding <=> query_vec
  limit match_count;
end;
$$;
