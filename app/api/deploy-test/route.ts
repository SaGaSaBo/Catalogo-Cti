import { NextResponse } from "next/server";

export async function GET() {
  const deployInfo = {
    timestamp: new Date().toISOString(),
    buildTime: process.env.BUILD_TIME || "unknown",
    vercel: !!process.env.VERCEL,
    nodeVersion: process.version,
    commit: process.env.VERCEL_GIT_COMMIT_SHA || "local",
    branch: process.env.VERCEL_GIT_COMMIT_REF || "main",
    message: "Deploy test endpoint - POST endpoint should be available now"
  };

  console.log("🚀 Deploy test endpoint called:", deployInfo);

  return NextResponse.json(deployInfo);
}
