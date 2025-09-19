# Políticas RLS (products, categories)

## Resumen
- **SELECT**: 1 sola política permisiva para `public`: `"Public read (single SELECT policy)"`.
- **INSERT/UPDATE/DELETE**: `"Admin write (…)"` para `authenticated` con `public.auth_is_admin()`.

## Motivo del cambio
Evitar advertencias de "multiple permissive policies" en Supabase sin alterar el comportamiento (lectura pública, escritura solo admin).

## Implementación
- Se eliminaron las políticas duplicadas de SELECT que causaban las advertencias
- Se mantiene el comportamiento exacto: lectura pública, escritura solo para admin
- Se creó una función helper `public.auth_is_admin()` para verificar permisos de administrador

## Futuras modificaciones
Para filtrar públicamente por `published`, cambiar `USING true` por `USING (coalesce(published, true) = true or public.auth_is_admin())` **solo si existe la columna**.

## Archivos relacionados
- `supabase/policies/fix_public_select_policies.sql` - Script de migración de políticas
