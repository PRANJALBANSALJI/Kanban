-- Create presence table for real-time collaboration
create table if not exists public.presence (
  id uuid primary key default gen_random_uuid(),
  board_id uuid not null references public.boards(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  status text not null default 'online' check (status in ('online', 'away', 'offline')),
  current_card_id uuid references public.cards(id) on delete set null,
  cursor_position jsonb,
  last_seen timestamp with time zone default now(),
  unique(board_id, user_id)
);

-- Enable RLS
alter table public.presence enable row level security;

-- RLS policies for presence
create policy "presence_select_board_member"
  on public.presence for select
  using (
    exists (
      select 1 from public.boards 
      where id = board_id and (
        owner_id = auth.uid() or 
        exists (
          select 1 from public.board_members 
          where board_id = presence.board_id and user_id = auth.uid()
        )
      )
    )
  );

create policy "presence_insert_own"
  on public.presence for insert
  with check (
    user_id = auth.uid() and
    exists (
      select 1 from public.boards 
      where id = board_id and (
        owner_id = auth.uid() or 
        exists (
          select 1 from public.board_members 
          where board_id = presence.board_id and user_id = auth.uid()
        )
      )
    )
  );

create policy "presence_update_own"
  on public.presence for update
  using (user_id = auth.uid());

create policy "presence_delete_own"
  on public.presence for delete
  using (user_id = auth.uid());

-- Create index for better performance
create index if not exists idx_presence_board_id on public.presence(board_id);
create index if not exists idx_presence_last_seen on public.presence(last_seen desc);
