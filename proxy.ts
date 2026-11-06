import { clerkMiddleware } from "@clerk/nextjs/server";

// Session plumbing only. Auth is enforced per resource (dashboard layout,
// requireWorkspace in route handlers), as Clerk v7 recommends; landing,
// sign-in/up, webhooks and the Meta deletion callback stay public.
export default clerkMiddleware();

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
