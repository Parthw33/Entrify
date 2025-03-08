
// import { NextResponse } from "next/server";
// import type { NextRequest } from "next/server";

// export async function middleware(request: NextRequest) {

//   // if (!token) {
//   //   return NextResponse.redirect(new URL("/login", request.url));
//   // }

//   // Protect admin routes
//   // if (request.nextUrl.pathname.startsWith("/admin")) {
//   //   if (token.role !== "ADMIN") {
//   //     return NextResponse.redirect(new URL("/home", request.url));
//   //   }
//   // }

//   return NextResponse.next();
// }

// export const config = {
//   matcher: ["/home/:path*", "/admin/:path*"],
// };

export { auth as middleware } from "@/auth"
