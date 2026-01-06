import arcjet, { detectBot, shield } from "@arcjet/next";
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isProtectedRoute = createRouteMatcher([
  "/dashboard(.*)",
  "/account(.*)",
  "/transaction(.*)",
]);

const aj = arcjet({
  key: process.env.ARCJET_KEY,
  rules: [
    shield({ mode: "LIVE" }),
    detectBot({
      mode: "LIVE",
      allow: ["CATEGORY:SEARCH_ENGINE", "GO_HTTP"],
    }),
  ],
});

export default clerkMiddleware((auth, req) => {
  const { userId, redirectToSignIn } = auth();

  if (!userId && isProtectedRoute(req)) {
    return redirectToSignIn();
  }

  const decision = aj.protect(req);

  if (decision.isDenied()) {
    return new NextResponse("Forbidden", { status: 403 });
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!_next|favicon.ico|.*\\..*).*)", "/(api|trpc)(.*)"],
};
