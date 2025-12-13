-- Enable the pgvector extension to work with embedding vectors
create extension if not exists vector;

-- Function to match candidates based on embedding similarity
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
  -- Cast text input to vector type
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

-- Function to match jobs based on embedding similarity
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
  -- Cast text input to vector type
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
