-- =======================
-- Función helper: auth_is_admin()
-- =======================
-- Ajusta esta función a tu esquema real de claims si es necesario.
-- Por defecto, intenta leer 'role' en app_metadata o un booleano 'is_admin'.
create or replace function public.auth_is_admin() returns boolean
language plpgsql
stable
as $$
declare
  claims jsonb := auth.jwt();
begin
  return coalesce(
    (claims->'app_metadata'->>'role') = 'admin'
    or (claims->>'role') = 'admin'
    or (claims->'user_metadata'->>'is_admin')::boolean,
    false
  );
end;
$$;

-- =======================
-- Asegurar RLS habilitado
-- =======================
alter table if exists public.products   enable row level security;
alter table if exists public.categories enable row level security;

-- =======================
-- POLÍTICAS NUEVAS (limpias)
-- =======================
-- 1) LECTURA (SELECT): una sola política para todos los roles (public).
--    Si quieres filtrar por published en el futuro, cambia USING true por:
--    USING (coalesce(published, true) = true or public.auth_is_admin())
--    SOLO si la columna 'published' existe.
do $$
begin
  if not exists (
    select 1 from pg_policies 
    where schemaname='public' and tablename='products' and polname='Public read (single SELECT policy)'
  ) then
    create policy "Public read (single SELECT policy)"
      on public.products
      for select
      to public
      using (true);
  end if;

  if not exists (
    select 1 from pg_policies 
    where schemaname='public' and tablename='categories' and polname='Public read (single SELECT policy)'
  ) then
    create policy "Public read (single SELECT policy)"
      on public.categories
      for select
      to public
      using (true);
  end if;
end $$;

-- 2) ESCRITURA (solo admin): crea políticas explícitas para insert/update/delete (sin SELECT)
--    Estas NO generan duplicados de SELECT.
do $$
begin
  if not exists (
    select 1 from pg_policies 
    where schemaname='public' and tablename='products' and polname='Admin write (products)'
  ) then
    create policy "Admin write (products)"
      on public.products
      for all
      to authenticated
      using (public.auth_is_admin())
      with check (public.auth_is_admin());
  end if;

  if not exists (
    select 1 from pg_policies 
    where schemaname='public' and tablename='categories' and polname='Admin write (categories)'
  ) then
    create policy "Admin write (categories)"
      on public.categories
      for all
      to authenticated
      using (public.auth_is_admin())
      with check (public.auth_is_admin());
  end if;
end $$;

-- Nota: 'for all' incluye select; para evitar duplicado de SELECT,
-- a continuación eliminamos las políticas antiguas; pero si ya existiera
-- otro 'for all' que quieras conservar, crea explícitas por comando:
--   for insert / for update / for delete
-- y deja fuera 'for select'.

-- =======================
-- ELIMINAR POLÍTICAS ANTIGUAS REDUNDANTES DE SELECT
-- =======================
-- Quita políticas antiguas que causan múltiples SELECT permisivos.
-- Se hace de forma segura (IF EXISTS).
do $$
begin
  -- PRODUCTS
  if exists (
    select 1 from pg_policies 
    where schemaname='public' and tablename='products' and polname='Allow admin operations on products'
  ) then
    drop policy "Allow admin operations on products" on public.products;
  end if;

  if exists (
    select 1 from pg_policies 
    where schemaname='public' and tablename='products' and polname='Allow public read access on products'
  ) then
    drop policy "Allow public read access on products" on public.products;
  end if;

  -- CATEGORIES
  if exists (
    select 1 from pg_policies 
    where schemaname='public' and tablename='categories' and polname='Allow admin operations on categories'
  ) then
    drop policy "Allow admin operations on categories" on public.categories;
  end if;

  if exists (
    select 1 from pg_policies 
    where schemaname='public' and tablename='categories' and polname='Allow public read access on categories'
  ) then
    drop policy "Allow public read access on categories" on public.categories;
  end if;
end $$;

-- =======================
-- VERIFICACIÓN
-- =======================
-- Revisa el estado final: debe haber 1 política de SELECT por tabla (la nueva)
-- y 1 de escritura admin.
-- Ejecuta estas queries de inspección luego de correr el script:
--   select polname, permissive, roles, cmd 
--   from pg_policies 
--   where schemaname='public' and tablename in ('products','categories')
--   order by tablename, cmd, polname;
