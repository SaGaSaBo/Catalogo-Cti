const REQUIRED_ENVS = [
  "NEXT_PUBLIC_SUPABASE_URL",
  // agrega otras si las usas en tiempo de build (NO agregues claves secretas que no se necesiten para compilar)
  // "NEXT_PUBLIC_ADMIN_SECRET",  // solo si la usas en el cliente
];

const missing = REQUIRED_ENVS.filter((k) => !process.env[k]);
console.log("🧪 Build env check:");
for (const k of REQUIRED_ENVS) {
  console.log(`  - ${k}: ${process.env[k] ? "OK" : "MISSING"}`);
}
if (missing.length) {
  console.error(`❌ Faltan variables de entorno para compilar: ${missing.join(", ")}`);
  process.exit(1);
} else {
  console.log("✅ Env mínima para compilar OK");
}
