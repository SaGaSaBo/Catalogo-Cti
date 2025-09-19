-- ✅ Recomendación de Supabase: fijar search_path a cadena vacía ('')
-- para que TODAS las referencias estén totalmente calificadas.
-- Fuente: https://supabase.com/docs/guides/database/database-advisors?lint=0011_function_search_path_mutable

-- A) Fijar search_path de la función existente (sin conocer la firma):
--    Descubrimos la firma y aplicamos ALTER FUNCTION dinámico.
do $$
declare
  sig text;
begin
  select '(' || pg_catalog.oidvectortypes(p.proargtypes) || ')'
    into sig
  from pg_proc p
  join pg_namespace n on n.oid = p.pronamespace
  where n.nspname = 'public'
    and p.proname = 'update_updated_at_column'
  limit 1;

  if sig is not null then
    execute format(
      $$alter function public.update_updated_at_column%s set search_path = '';$$,
      sig
    );
  end if;
end $$;

-- B) Si además tienes otra helper (por ejemplo public.set_updated_at), también la fijamos si existe.
do $$
declare
  sig text;
begin
  select '(' || pg_catalog.oidvectortypes(p.proargtypes) || ')'
    into sig
  from pg_proc p
  join pg_namespace n on n.oid = p.pronamespace
  where n.nspname = 'public'
    and p.proname = 'set_updated_at'
  limit 1;

  if sig is not null then
    execute format(
      $$alter function public.set_updated_at%s set search_path = '';$$,
      sig
    );
  end if;
end $$;

-- C) Verificación rápida: proconfig debe incluir "search_path="
select n.nspname as schema, p.proname as function, p.proconfig
from pg_proc p
join pg_namespace n on n.oid = p.pronamespace
where n.nspname='public'
  and p.proname in ('update_updated_at_column','set_updated_at');
