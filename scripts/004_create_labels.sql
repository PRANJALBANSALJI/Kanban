-- Create labels table
create table if not exists public.labels (
  id uuid primary key default gen_random_uuid(),
  board_id uuid not null references public.boards(id) on delete cascade,
  name text not null,
  color text not null default '#6b7280',
  created_at timestamp with time zone default now()
);

-- Enable RLS
alter table public.labels enable row level security;

-- RLS policies for labels
create policy "labels_select_board_member"
  on public.labels for select
  using (
    exists (
      select 1 from public.boards 
      where id = board_id and (
        owner_id = auth.uid() or 
        exists (
          select 1 from public.board_members 
          where board_id = labels.board_id and user_id = auth.uid()
        )
      )
    )
  );

create policy "labels_insert_board_member"
  on public.labels for insert
  with check (
    exists (
      select 1 from public.boards 
      where id = board_id and (
        owner_id = auth.uid() or 
        exists (
          select 1 from public.board_members 
          where board_id = labels.board_id and user_id = auth.uid()
        )
      )
    )
  );

create policy "labels_update_board_member"
  on public.labels for update
  using (
    exists (
      select 1 from public.boards 
      where id = board_id and (
        owner_id = auth.uid() or 
        exists (
          select 1 from public.board_members 
          where board_id = labels.board_id and user_id = auth.uid()
        )
      )
    )
  );

create policy "labels_delete_board_admin"
  on public.labels for delete
  using (
    exists (
      select 1 from public.boards 
      where id = board_id and (
        owner_id = auth.uid() or 
        exists (
          select 1 from public.board_members 
          where board_id = labels.board_id and user_id = auth.uid() and role in ('owner', 'admin')
        )
      )
    )
  );
