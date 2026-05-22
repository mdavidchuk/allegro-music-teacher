import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const ACCESS_COOKIE = "allegro-access";
const isGatePath = createRouteMatcher(["/access"]);

const isClerkPublic = createRouteMatcher([
  "/sign-in(.*)",
  "/sign-up(.*)",
]);

function withAccessGate(req: NextRequest) {
  const password = process.env.BETA_PASSWORD;

  // No password set → gate is disabled
  if (!password) return null;

  // Already on the access page → let through
  if (isGatePath(req)) return null;

  // Has valid access cookie → let through
  const cookie = req.cookies.get(ACCESS_COOKIE);
  if (cookie?.value === password) return null;

  // Redirect everything else to /access
  const url = req.nextUrl.clone();
  url.pathname = "/access";
  return NextResponse.redirect(url);
}

export default clerkMiddleware(async (auth, req) => {
  // Access gate runs before Clerk auth
  const gateResponse = withAccessGate(req);
  if (gateResponse) return gateResponse;

  // Clerk auth — protect everything except sign-in/sign-up
  if (!isClerkPublic(req)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
