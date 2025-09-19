console.log("🧩 Build context");
console.log("  node:", process.version);
console.log("  platform:", process.platform, process.arch);
console.log("  NEXT_RUNTIME:", process.env.NEXT_RUNTIME);
console.log("  VERCEL:", !!process.env.VERCEL);
console.log("  CI:", !!process.env.CI);
