import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isProtectedRoute = createRouteMatcher(["/dashboard(.*)"]);
const isPublicRoute = createRouteMatcher(["/", "/sign-in(.*)", "/sign-up(.*)", "/apply(.*)", "/select-org"]);

export default clerkMiddleware(async (auth, req) => {
  // Allow public routes
  if (isPublicRoute(req)) {
    return;
  }
  
  // Protect dashboard routes
  if (isProtectedRoute(req)) {
    const authObj = await auth();
    const { userId, orgId, orgRole } = authObj;
    
    // Must be signed in
    if (!userId) {
      return authObj.redirectToSignIn({ returnBackUrl: req.url });
    }
    
    // Must have active org
    if (!orgId) {
      return Response.redirect(new URL("/select-org", req.url));
    }
    
    // Must have proper role
    if (orgRole !== "org:admin" && orgRole !== "org:member") {
      return Response.redirect(new URL("/select-org", req.url));
    }
  }
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
