begin;
create table public.scrapbook_owner (
  singleton boolean primary key default true check (singleton),
  user_id uuid not null unique references auth.users(id)
);
alter table public.scrapbook_owner enable row level security;
revoke all on public.scrapbook_owner from anon, authenticated;
grant select on public.scrapbook_owner to authenticated;
create policy owner_self on public.scrapbook_owner for select to authenticated
  using (user_id = (select auth.uid()));

create table public.scrapbook_journal (
  user_id uuid primary key references auth.users(id),
  entries jsonb not null default '[]'::jsonb check (jsonb_typeof(entries) = 'array'),
  revision integer not null default 0,
  updated_at timestamptz not null default now()
);
alter table public.scrapbook_journal enable row level security;
revoke all on public.scrapbook_journal from anon, authenticated;
grant select on public.scrapbook_journal to authenticated;
create policy journal_owner_read on public.scrapbook_journal for select to authenticated
  using (user_id = (select auth.uid()) and exists (
    select 1 from public.scrapbook_owner o where o.user_id = (select auth.uid())
  ));

-- Escrita somente por esta função: a revisão evita sobrescrever outro dispositivo.
create function public.save_scrapbook(p_entries jsonb, p_revision integer)
returns integer language plpgsql security definer set search_path = '' as $$
declare v_uid uuid := auth.uid(); v_revision integer;
begin
  if v_uid is null or not exists (select 1 from public.scrapbook_owner where user_id = v_uid) then
    raise exception 'Acesso negado' using errcode = '42501';
  end if;
  if jsonb_typeof(p_entries) is distinct from 'array' or octet_length(p_entries::text) > 20000000 then
    raise exception 'Conteúdo inválido ou maior que 20 MB';
  end if;
  insert into public.scrapbook_journal(user_id) values (v_uid) on conflict do nothing;
  update public.scrapbook_journal set entries = p_entries, revision = revision + 1, updated_at = now()
    where user_id = v_uid and revision = p_revision returning revision into v_revision;
  if v_revision is null then raise exception 'REVISION_CONFLICT'; end if;
  return v_revision;
end;
$$;
revoke all on function public.save_scrapbook(jsonb, integer) from public, anon;
grant execute on function public.save_scrapbook(jsonb, integer) to authenticated;
commit;

-- Após criar a conta da Bia no Supabase Auth, vincular o UUID verificado:
-- insert into public.scrapbook_owner (user_id) values ('UUID-DA-BIA');
