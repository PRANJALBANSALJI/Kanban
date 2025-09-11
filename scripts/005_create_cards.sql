-- Create cards table
create table if not exists public.cards (
  id uuid primary key default gen_random_uuid(),
  column_id uuid not null references public.columns(id) on delete cascade,
  title text not null,
  description text,
  position integer not null,
  assignee_id uuid references public.profiles(id) on delete set null,
  due_date timestamp with time zone,
  created_by uuid not null references public.profiles(id) on delete cascade,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Enable RLS
alter table public.cards enable row level security;

-- Create card_labels junction table
create table if not exists public.card_labels (
  id uuid primary key default gen_random_uuid(),
  card_id uuid not null references public.cards(id) on delete cascade,
  label_id uuid not null references public.labels(id) on delete cascade,
  created_at timestamp with time zone default now(),
  unique(card_id, label_id)
);

-- Enable RLS
alter table public.card_labels enable row level security;

-- RLS policies for cards
create policy "cards_select_board_member"
  on public.cards for select
  using (
    exists (
      select 1 from public.columns c
      join public.boards b on c.board_id = b.id
      where c.id = column_id and (
        b.owner_id = auth.uid() or 
        exists (
          select 1 from public.board_members 
          where board_id = b.id and user_id = auth.uid()
        )
      )
    )
  );

create policy "cards_insert_board_member"
  on public.cards for insert
  with check (
    exists (
      select 1 from public.columns c
      join public.boards b on c.board_id = b.id
      where c.id = column_id and (
        b.owner_id = auth.uid() or 
        exists (
          select 1 from public.board_members 
          where board_id = b.id and user_id = auth.uid()
        )
      )
    ) and created_by = auth.uid()
  );

create policy "cards_update_board_member"
  on public.cards for update
  using (
    exists (
      select 1 from public.columns c
      join public.boards b on c.board_id = b.id
      where c.id = column_id and (
        b.owner_id = auth.uid() or 
        exists (
          select 1 from public.board_members 
          where board_id = b.id and user_id = auth.uid()
        )
      )
    )
  );

create policy "cards_delete_board_member"
  on public.cards for delete
  using (
    exists (
      select 1 from public.columns c
      join public.boards b on c.board_id = b.id
      where c.id = column_id and (
        b.owner_id = auth.uid() or 
        exists (
          select 1 from public.board_members 
          where board_id = b.id and user_id = auth.uid()
        )
      )
    )
  );

-- RLS policies for card_labels
create policy "card_labels_select_board_member"
  on public.card_labels for select
  using (
    exists (
      select 1 from public.cards ca
      join public.columns co on ca.column_id = co.id
      join public.boards b on co.board_id = b.id
      where ca.id = card_id and (
        b.owner_id = auth.uid() or 
        exists (
          select 1 from public.board_members 
          where board_id = b.id and user_id = auth.uid()
        )
      )
    )
  );

create policy "card_labels_insert_board_member"
  on public.card_labels for insert
  with check (
    exists (
      select 1 from public.cards ca
      join public.columns co on ca.column_id = co.id
      join public.boards b on co.board_id = b.id
      where ca.id = card_id and (
        b.owner_id = auth.uid() or 
        exists (
          select 1 from public.board_members 
          where board_id = b.id and user_id = auth.uid()
        )
      )
    )
  );

create policy "card_labels_delete_board_member"
  on public.card_labels for delete
  using (
    exists (
      select 1 from public.cards ca
      join public.columns co on ca.column_id = co.id
      join public.boards b on co.board_id = b.id
      where ca.id = card_id and (
        b.owner_id = auth.uid() or 
        exists (
          select 1 from public.board_members 
          where board_id = b.id and user_id = auth.uid()
        )
      )
    )
  );
