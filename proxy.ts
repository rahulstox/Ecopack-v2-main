import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

// Define routes that should be publicly accessible
const isPublicRoute = createRouteMatcher([
  "/", // Allow access to the homepage
  "/sign-in(.*)", // Clerk's sign-in routes
  "/sign-up(.*)", // Clerk's sign-up routes
  "/api/webhooks(.*)", // Allow webhooks
  "/onboarding", // Allow access to onboarding/profile page itself
  "/api/init", // Database initialization endpoint
  "/api/test-env", // Test environment endpoint
  "/api/test-models", // Test models endpoint
  "/api/recommendations", // Recommendations listing (public)
  // NOTE: /api/profile and other protected endpoints are NOT listed here
]);

export default clerkMiddleware((auth, req) => {
  // If the route is PUBLIC, allow access.
  if (isPublicRoute(req)) {
    return; // Returning nothing allows public access
  }

  // If the route is NOT public, Clerk's default behavior takes over:
  // - If logged out: Redirects to sign-in.
  // - If logged in: Allows access.
  // We DO NOT need to call auth().protect() here.
});

export const config = {
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
};
