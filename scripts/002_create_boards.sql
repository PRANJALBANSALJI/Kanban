-- Create boards table
create table if not exists public.boards (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  owner_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Enable RLS
alter table public.boards enable row level security;

-- Create board_members table for collaboration
create table if not exists public.board_members (
  id uuid primary key default gen_random_uuid(),
  board_id uuid not null references public.boards(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  role text not null default 'member' check (role in ('owner', 'admin', 'member')),
  created_at timestamp with time zone default now(),
  unique(board_id, user_id)
);

-- Enable RLS
alter table public.board_members enable row level security;

-- RLS policies for boards
create policy "boards_select_member"
  on public.boards for select
  using (
    auth.uid() = owner_id or 
    exists (
      select 1 from public.board_members 
      where board_id = boards.id and user_id = auth.uid()
    )
  );

create policy "boards_insert_own"
  on public.boards for insert
  with check (auth.uid() = owner_id);

create policy "boards_update_member"
  on public.boards for update
  using (
    auth.uid() = owner_id or 
    exists (
      select 1 from public.board_members 
      where board_id = boards.id and user_id = auth.uid() and role in ('owner', 'admin')
    )
  );

create policy "boards_delete_owner"
  on public.boards for delete
  using (auth.uid() = owner_id);

-- RLS policies for board_members
create policy "board_members_select_member"
  on public.board_members for select
  using (
    exists (
      select 1 from public.boards 
      where id = board_id and (
        owner_id = auth.uid() or 
        exists (
          select 1 from public.board_members bm2 
          where bm2.board_id = board_id and bm2.user_id = auth.uid()
        )
      )
    )
  );

create policy "board_members_insert_admin"
  on public.board_members for insert
  with check (
    exists (
      select 1 from public.boards 
      where id = board_id and (
        owner_id = auth.uid() or 
        exists (
          select 1 from public.board_members bm2 
          where bm2.board_id = board_id and bm2.user_id = auth.uid() and bm2.role in ('owner', 'admin')
        )
      )
    )
  );

create policy "board_members_update_admin"
  on public.board_members for update
  using (
    exists (
      select 1 from public.boards 
      where id = board_id and (
        owner_id = auth.uid() or 
        exists (
          select 1 from public.board_members bm2 
          where bm2.board_id = board_id and bm2.user_id = auth.uid() and bm2.role in ('owner', 'admin')
        )
      )
    )
  );

create policy "board_members_delete_admin"
  on public.board_members for delete
  using (
    exists (
      select 1 from public.boards 
      where id = board_id and (
        owner_id = auth.uid() or 
        exists (
          select 1 from public.board_members bm2 
          where bm2.board_id = board_id and bm2.user_id = auth.uid() and bm2.role in ('owner', 'admin')
        )
      )
    )
  );
