import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

// Mark routes that require authentication
const isProtectedRoute = createRouteMatcher(["/dashboard(.*)", "/api/(.*)"]);

export default clerkMiddleware(async (auth, req) => {
  if (isProtectedRoute(req)) {
    // Use auth.protect() to ensure user is authenticated
    // This will handle redirects automatically
    await auth.protect();
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
