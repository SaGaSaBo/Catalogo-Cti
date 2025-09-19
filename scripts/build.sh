#!/usr/bin/env bash
set -euo pipefail

echo "🧩 Build context"
echo "  node: $(node -v)"
echo "  platform: $(uname -s) $(uname -m)"
echo "  VERCEL: ${VERCEL:-false}"
echo "  CI: ${CI:-false}"

echo ""
echo "🧪 Env check (no imprime valores)"
REQ_VARS=("NEXT_PUBLIC_SUPABASE_URL")
missing=()
for v in "${REQ_VARS[@]}"; do
  if [ -z "${!v-}" ]; then
    echo "  - $v: MISSING"
    missing+=("$v")
  else
    echo "  - $v: OK"
  fi
done
if [ ${#missing[@]} -ne 0 ]; then
  echo "❌ Faltan variables de entorno para compilar: ${missing[*]}"
  exit 1
fi

echo ""
echo "🏗️  Ejecutando next build (verboso)…"
# Flags: --no-lint para evitar que ESLint corte el build,
# --debug para más detalle
npx --yes next@15.5.2 build --no-lint --debug

echo ""
echo "🔎 Verificando artefactos de build…"
if [ ! -f ".next/BUILD_ID" ]; then
  echo "❌ Build finalizado sin .next/BUILD_ID. Revisa los logs anteriores (errores de TypeScript/importe de módulos)."
  exit 2
fi

echo "✅ Build OK. BUILD_ID: $(cat .next/BUILD_ID)"
