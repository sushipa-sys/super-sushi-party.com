-- =====================================================================
--  SUPER SUSHI PARTY / すしむら  —  マルチプレイ用 Supabase スキーマ
-- =====================================================================
--  使い方:
--   1) Supabase ダッシュボード → SQL Editor に、このファイルを丸ごと貼って RUN
--   2) Authentication → Providers で「Anonymous」を有効化
--   3) （pg_cron でエラーが出たら）Database → Extensions で pg_cron を ON にして再実行
--
--  スロット(隅)の対応 ※配置はクライアント側で:
--     slot 0 = 左上 / 1 = 右上 / 2 = 左下 / 3 = 右下
--     claim_slot が -1 を返したら「満室 → 観戦」
--
--  クライアントが呼ぶRPC:
--     claim_slot(name)          -> int   入室時に隅を確保（-1=観戦）
--     heartbeat()               -> void  数秒ごとに生存報告（離脱検知）
--     release_slot()            -> void  退室時に隅を解放
--     save_house(data, name)    -> void  家の内装(JSON)を保存(upsert)
--     post_log(text, name)      -> void  コメント投稿（文字数/レート制限つき）
--   読み取りは直接 select 可:
--     select * from slots;                              -- 誰がどの隅か
--     select * from houses where player_id = auth.uid();-- 自分の家
--     select * from houses;                             -- 全員の家（隅の描画用）
--     select * from logs order by ts desc limit 100;    -- 直近ログ
--   位置(マーティーの移動)は DB を使わず Realtime Broadcast で流します。
-- =====================================================================

-- ログ自動削除に使う拡張（ダッシュボードで有効化済みなら不要）
create extension if not exists pg_cron;

-- ---------------------------------------------------------------------
-- 1) slots : 4隅の家（0=左上, 1=右上, 2=左下, 3=右下）
-- ---------------------------------------------------------------------
create table if not exists public.slots (
  slot_index  int primary key check (slot_index between 0 and 3),
  player_id   uuid,
  name        text,
  claimed_at  timestamptz,
  last_seen   timestamptz
);
insert into public.slots (slot_index) values (0),(1),(2),(3)
  on conflict (slot_index) do nothing;

-- ---------------------------------------------------------------------
-- 2) houses : 各プレイヤーの家の内装（localStorage と同じレイアウトJSON）
--     data には placed / roomItems / owned / inv / maxTension / rice などを入れる
-- ---------------------------------------------------------------------
create table if not exists public.houses (
  player_id  uuid primary key,
  name       text,
  data       jsonb not null,
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- 3) logs : みんなのコメント（約1ヶ月保持。下部の cron で自動削除）
-- ---------------------------------------------------------------------
create table if not exists public.logs (
  id        bigint generated always as identity primary key,
  player_id uuid,
  name      text,
  text      text not null,
  ts        timestamptz not null default now()
);
create index if not exists logs_ts_idx on public.logs (ts desc);

-- =====================================================================
--  RLS（行レベルセキュリティ）
--   読みは全員(authenticated)可 … 他人の家/ログを表示するため
--   書きは作らない  … insert/update/delete は下の RPC 経由のみ
-- =====================================================================
alter table public.slots  enable row level security;
alter table public.houses enable row level security;
alter table public.logs   enable row level security;

drop policy if exists slots_read  on public.slots;
drop policy if exists houses_read on public.houses;
drop policy if exists logs_read   on public.logs;

create policy slots_read  on public.slots  for select to authenticated using (true);
create policy houses_read on public.houses for select to authenticated using (true);
create policy logs_read   on public.logs   for select to authenticated using (true);

-- =====================================================================
--  RPC 関数（security definer = RLS をバイパスして安全に書き込む）
-- =====================================================================

-- 空きスロットを1つ確保。満室なら -1（観戦）。既に持っていればそれを返す。
create or replace function public.claim_slot(p_name text)
returns int
language plpgsql
security definer
set search_path = public
as $$
declare
  uid    uuid := auth.uid();
  v_slot int;
  nm     text;
begin
  if uid is null then raise exception 'not authenticated'; end if;
  nm := left(coalesce(nullif(btrim(p_name), ''), 'ゲスト'), 12);

  -- 既に自分のスロットがあれば、更新して返す（再接続対応）
  select slot_index into v_slot from slots where player_id = uid;
  if v_slot is not null then
    update slots set last_seen = now(), name = nm where slot_index = v_slot;
    return v_slot;
  end if;

  -- 落ちた人のスロットを解放（30秒ハートビート切れ）
  update slots set player_id = null, name = null
   where player_id is not null and last_seen < now() - interval '30 seconds';

  -- いちばん小さい空きスロットを原子的に確保
  select slot_index into v_slot
    from slots
   where player_id is null
   order by slot_index
   for update skip locked
   limit 1;

  if v_slot is null then
    return -1;  -- 満室 → 観戦
  end if;

  update slots
     set player_id = uid, name = nm, claimed_at = now(), last_seen = now()
   where slot_index = v_slot;

  return v_slot;
end;
$$;

-- 生存報告（数秒ごとに呼ぶ）。ついでに古いスロットも解放。
create or replace function public.heartbeat()
returns void
language plpgsql
security definer
set search_path = public
as $$
declare uid uuid := auth.uid();
begin
  if uid is null then return; end if;
  update slots set last_seen = now() where player_id = uid;
  update slots set player_id = null, name = null
   where player_id is not null and last_seen < now() - interval '30 seconds';
end;
$$;

-- 退室時にスロットを解放
create or replace function public.release_slot()
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update slots set player_id = null, name = null where player_id = auth.uid();
end;
$$;

-- 家の内装を保存（upsert）。肥大化防止のサイズ上限つき。
create or replace function public.save_house(p_data jsonb, p_name text)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare uid uuid := auth.uid();
begin
  if uid is null then raise exception 'not authenticated'; end if;
  if pg_column_size(p_data) > 300000 then raise exception 'house data too large'; end if;
  insert into houses (player_id, name, data, updated_at)
  values (uid, left(coalesce(nullif(btrim(p_name), ''), 'ゲスト'), 12), p_data, now())
  on conflict (player_id)
  do update set data = excluded.data, name = excluded.name, updated_at = now();
end;
$$;

-- コメント投稿（文字数制限＋レート制限）
create or replace function public.post_log(p_text text, p_name text)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  uid uuid := auth.uid();
  t   text;
  nm  text;
begin
  if uid is null then raise exception 'not authenticated'; end if;
  t  := left(btrim(p_text), 120);
  nm := left(coalesce(nullif(btrim(p_name), ''), 'ゲスト'), 12);
  if t = '' then return; end if;
  -- レート制限: 直近10秒で5件まで
  if (select count(*) from logs where player_id = uid and ts > now() - interval '10 seconds') >= 5 then
    raise exception 'rate limited';
  end if;
  insert into logs (player_id, name, text) values (uid, nm, t);
end;
$$;

-- 実行権限（匿名サインインでも role は authenticated）
grant execute on function public.claim_slot(text)        to authenticated;
grant execute on function public.heartbeat()             to authenticated;
grant execute on function public.release_slot()          to authenticated;
grant execute on function public.save_house(jsonb, text) to authenticated;
grant execute on function public.post_log(text, text)    to authenticated;

-- =====================================================================
--  Realtime（クライアントへ変更を配信）
--   slots: 誰がどの隅にいるか / logs: 新しいコメント
--   ※ マーティーの位置は Broadcast（DB不使用）なのでここには入れない
-- =====================================================================
do $$
begin
  begin alter publication supabase_realtime add table public.slots; exception when others then null; end;
  begin alter publication supabase_realtime add table public.logs;  exception when others then null; end;
end $$;

-- =====================================================================
--  ログ自動削除（毎日 04:15 UTC）: 30日より古い + 総件数の安全上限
-- =====================================================================
do $$
begin
  perform cron.unschedule('ssp_prune_logs');
exception when others then null;
end $$;

select cron.schedule(
  'ssp_prune_logs',
  '15 4 * * *',
  $$
    delete from public.logs where ts < now() - interval '30 days';
    delete from public.logs
     where id < (select coalesce(min(id), 0)
                   from (select id from public.logs order by id desc limit 20000) keep);
  $$
);

-- =====================================================================
--  動作確認クエリ（任意）
--   select * from public.slots order by slot_index;
--   select public.claim_slot('テスト');   -- 認証済みセッションで実行すると 0..3 か -1
-- =====================================================================
