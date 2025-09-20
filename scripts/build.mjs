import { spawnSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import os from "node:os";

const req = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY"
  // agrega aquí otras ENV públicas necesarias en build si aplica,
  // p.ej. "NEXT_PUBLIC_ADMIN_SECRET" SOLO si el cliente la necesita para compilar
];

console.log("🧩 Build context");
console.log("  node:", process.version);
console.log("  platform:", os.platform(), os.arch());
console.log("  VERCEL:", !!process.env.VERCEL);
console.log("  CI:", !!process.env.CI);

console.log("\n🧪 Env check (no imprime valores):");
let missing = [];
for (const k of req) {
  const ok = !!process.env[k];
  console.log(`  - ${k}: ${ok ? "OK" : "MISSING"}`);
  if (!ok) missing.push(k);
}
if (missing.length) {
  console.error(`\n❌ Faltan variables de entorno para compilar: ${missing.join(", ")}`);
  process.exit(1);
}

console.log("\n🏗️  Ejecutando next build (verboso)…");
const r = spawnSync("npx", ["next@15.5.2", "build", "--no-lint", "--debug"], {
  stdio: "inherit",
  env: process.env,
  shell: false,
});
if (r.status !== 0) {
  console.error(`\n❌ next build salió con código ${r.status}. Revisa el stack anterior.`);
  process.exit(r.status ?? 2);
}

console.log("\n🔎 Verificando artefactos…");
if (!existsSync(".next/BUILD_ID")) {
  console.error("❌ Build finalizado sin .next/BUILD_ID. Puede haber errores de TypeScript, imports o configuración.");
  process.exit(2);
}
console.log("✅ BUILD_ID:", readFileSync(".next/BUILD_ID", "utf8").trim());
