-- Slice 10: admin catalog write policies

create policy games_admin_all
  on public.games for all to authenticated
  using (public.admin_has_scope('catalog'))
  with check (public.admin_has_scope('catalog'));

create policy platforms_admin_all
  on public.platforms for all to authenticated
  using (public.admin_has_scope('catalog'))
  with check (public.admin_has_scope('catalog'));

create policy game_platforms_admin_all
  on public.game_platforms for all to authenticated
  using (public.admin_has_scope('catalog'))
  with check (public.admin_has_scope('catalog'));

create policy crossplay_sets_admin_all
  on public.crossplay_sets for all to authenticated
  using (public.admin_has_scope('catalog'))
  with check (public.admin_has_scope('catalog'));

grant insert, update, delete on public.games to authenticated;
grant insert, update, delete on public.platforms to authenticated;
grant insert, update, delete on public.game_platforms to authenticated;
grant insert, update, delete on public.crossplay_sets to authenticated;

create or replace function public.set_catalog_game_platforms(
  p_game_id uuid,
  p_platform_ids uuid[]
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.admin_has_scope('catalog') then
    raise exception 'forbidden';
  end if;

  if p_game_id is null or coalesce(array_length(p_platform_ids, 1), 0) = 0 then
    raise exception 'at least one platform is required';
  end if;

  if not exists (select 1 from public.games where id = p_game_id) then
    raise exception 'game not found';
  end if;

  if exists (
    select 1
    from unnest(p_platform_ids) requested(platform_id)
    left join public.platforms p
      on p.id = requested.platform_id
      and p.is_active = true
    where p.id is null
  ) then
    raise exception 'invalid platform';
  end if;

  delete from public.game_platforms
  where game_id = p_game_id;

  insert into public.game_platforms (game_id, platform_id)
  select p_game_id, platform_id
  from unnest(p_platform_ids) requested(platform_id)
  on conflict do nothing;
end;
$$;

revoke all on function public.set_catalog_game_platforms(uuid, uuid[]) from public;
grant execute on function public.set_catalog_game_platforms(uuid, uuid[]) to authenticated;
