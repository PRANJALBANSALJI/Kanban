-- Create audit_logs table for tracking all actions
create table if not exists public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  board_id uuid not null references public.boards(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  action text not null,
  entity_type text not null,
  entity_id uuid not null,
  old_values jsonb,
  new_values jsonb,
  created_at timestamp with time zone default now()
);

-- Enable RLS
alter table public.audit_logs enable row level security;

-- RLS policies for audit_logs
create policy "audit_logs_select_board_member"
  on public.audit_logs for select
  using (
    exists (
      select 1 from public.boards 
      where id = board_id and (
        owner_id = auth.uid() or 
        exists (
          select 1 from public.board_members 
          where board_id = audit_logs.board_id and user_id = auth.uid()
        )
      )
    )
  );

create policy "audit_logs_insert_board_member"
  on public.audit_logs for insert
  with check (
    exists (
      select 1 from public.boards 
      where id = board_id and (
        owner_id = auth.uid() or 
        exists (
          select 1 from public.board_members 
          where board_id = audit_logs.board_id and user_id = auth.uid()
        )
      )
    ) and user_id = auth.uid()
  );

-- Create index for better performance
create index if not exists idx_audit_logs_board_id on public.audit_logs(board_id);
create index if not exists idx_audit_logs_created_at on public.audit_logs(created_at desc);
