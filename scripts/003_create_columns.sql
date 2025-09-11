-- Create columns table
create table if not exists public.columns (
  id uuid primary key default gen_random_uuid(),
  board_id uuid not null references public.boards(id) on delete cascade,
  title text not null,
  position integer not null,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Enable RLS
alter table public.columns enable row level security;

-- RLS policies for columns
create policy "columns_select_board_member"
  on public.columns for select
  using (
    exists (
      select 1 from public.boards 
      where id = board_id and (
        owner_id = auth.uid() or 
        exists (
          select 1 from public.board_members 
          where board_id = columns.board_id and user_id = auth.uid()
        )
      )
    )
  );

create policy "columns_insert_board_member"
  on public.columns for insert
  with check (
    exists (
      select 1 from public.boards 
      where id = board_id and (
        owner_id = auth.uid() or 
        exists (
          select 1 from public.board_members 
          where board_id = columns.board_id and user_id = auth.uid()
        )
      )
    )
  );

create policy "columns_update_board_member"
  on public.columns for update
  using (
    exists (
      select 1 from public.boards 
      where id = board_id and (
        owner_id = auth.uid() or 
        exists (
          select 1 from public.board_members 
          where board_id = columns.board_id and user_id = auth.uid()
        )
      )
    )
  );

create policy "columns_delete_board_admin"
  on public.columns for delete
  using (
    exists (
      select 1 from public.boards 
      where id = board_id and (
        owner_id = auth.uid() or 
        exists (
          select 1 from public.board_members 
          where board_id = columns.board_id and user_id = auth.uid() and role in ('owner', 'admin')
        )
      )
    )
  );
