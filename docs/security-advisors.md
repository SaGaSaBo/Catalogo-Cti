# Notas de seguridad (Supabase Advisors)

## Function Search Path Mutable

- **Problema**: Funciones con `search_path` mutable pueden ser vulnerables a ataques de inyección de esquemas.
- **Solución**: Fijamos `search_path = ''` en funciones `public.update_updated_at_column` y `public.set_updated_at` mediante SQL idempotente.
- **Motivo**: Evitar que el `search_path` quede mutable en funciones (especialmente `SECURITY DEFINER`), lo cual puede permitir que objetos con el mismo nombre en esquemas no confiables alteren el comportamiento.
- **Verificación**: Ejecutar el SELECT del final de `supabase/security/fix_function_search_path.sql`. Debe verse `search_path` aplicado en `proconfig`.
- **Siguiente paso**: Re-ejecutar el **Security Advisor** en el Dashboard de Supabase.

## Archivos relacionados

- `supabase/security/fix_function_search_path.sql` - Script SQL para fijar search_path
- `supabase/triggers/updated_at_fix.sql` - Triggers idempotentes con funciones seguras

## Referencias

- [Supabase Security Advisors](https://supabase.com/docs/guides/database/database-advisors?lint=0011_function_search_path_mutable)
- [PostgreSQL Search Path Security](https://www.postgresql.org/docs/current/ddl-schemas.html#DDL-SCHEMAS-PATH)
