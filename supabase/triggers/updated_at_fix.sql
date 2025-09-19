-- ============
-- Función helper (idempotente)
-- ============
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  -- si la columna no existe en la fila, no hacemos nada
  begin
    new.updated_at := now(); -- usa timestamptz del server
  exception when others then
    -- ignora si la columna no existe
    null;
  end;
  return new;
end;
$$;

-- ============
-- Columnas updated_at (idempotente)
-- ============
alter table if exists public.categories
  add column if not exists updated_at timestamptz not null default now();

alter table if exists public.products
  add column if not exists updated_at timestamptz not null default now();

-- ============
-- Triggers idempotentes (NO existe CREATE TRIGGER IF NOT EXISTS)
-- Usamos DO $$ ... $$ para chequear el catálogo antes de crear.
-- ============

do $$
begin
  if not exists (
    select 1
    from pg_trigger t
    where t.tgname = 'update_categories_updated_at'
      and t.tgrelid = 'public.categories'::regclass
      and not t.tgisinternal
  ) then
    create trigger update_categories_updated_at
    before update on public.categories
    for each row
    execute function public.set_updated_at();
  end if;
end
$$;

do $$
begin
  if not exists (
    select 1
    from pg_trigger t
    where t.tgname = 'update_products_updated_at'
      and t.tgrelid = 'public.products'::regclass
      and not t.tgisinternal
  ) then
    create trigger update_products_updated_at
    before update on public.products
    for each row
    execute function public.set_updated_at();
  end if;
end
$$;

-- ============
-- Diagnóstico rápido (puedes ejecutar esto aparte para ver estado)
-- ============
-- select c.relname as table_name, t.tgname as trigger_name, p.proname as func_name
-- from pg_trigger t
-- join pg_class c on c.oid = t.tgrelid
-- join pg_proc  p on p.oid = t.tgfoid
-- where not t.tgisinternal
--   and c.relname in ('categories','products')
-- order by c.relname, t.tgname;
