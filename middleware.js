import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import aj from "./lib/arcjet"; // 🔴 adjust path if needed

const isProtectedRoute = createRouteMatcher([
  "/dashboard(.*)",
  "/account(.*)",
  "/transaction(.*)",
]);

export default clerkMiddleware(async (auth, req) => {
  // ✅ Clerk MUST run first
  const { userId, redirectToSignIn } = auth();

  // 🔐 Protect authenticated routes
  if (!userId && isProtectedRoute(req)) {
    return redirectToSignIn();
  }

  // 🛡️ ArcJet MUST be awaited
  const decision = await aj.protect(req);

  if (decision.isDenied()) {
    return new NextResponse("Too Many Requests", { status: 429 });
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!_next|favicon.ico|.*\\..*).*)", "/(api|trpc)(.*)"],
};
