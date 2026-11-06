import { NextResponse, type NextRequest } from "next/server";

// ponytail: stopgap HTTP Basic gate until Clerk lands (phase 1). Set
// SITE_PASSWORD in Vercel to close the anonymous /api/analyze cost leak today.
export function proxy(req: NextRequest) {
  const password = process.env.SITE_PASSWORD;
  if (!password) return NextResponse.next();

  const header = req.headers.get("authorization") ?? "";
  const [scheme, encoded] = header.split(" ");
  if (scheme === "Basic" && encoded) {
    const [, given] = atob(encoded).split(":");
    if (given === password) return NextResponse.next();
  }
  return new NextResponse("Authentication required", {
    status: 401,
    headers: { "WWW-Authenticate": 'Basic realm="Andromeda"' },
  });
}

export const config = {
  // Meta OAuth callback must stay reachable from Facebook's redirect.
  matcher: ["/((?!_next/|favicon.ico|api/meta/callback).*)"],
};
