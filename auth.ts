import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import NextAuth from "next-auth";
import Google from "next-auth/providers/google";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      role?: string | null;
      image?: string | null;
    };
  }
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  session: {
    strategy: "jwt",
    maxAge: 1 * 24 * 60 * 60, // 1 day
  },

  secret: process.env.AUTH_SECRET,
  // Removing Prisma adapter to use purely JWT-based auth
  // adapter: PrismaAdapter(prisma),

  providers: [Google],

  callbacks: {
    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id;
        token.email = user.email || undefined;
      }
      
      // If we have a token with an email, fetch or create the user in our database
      if (token.email) {
        try {
          // Find or create user in our database
          const dbUser = await prisma.user.upsert({
            where: { email: token.email as string },
            update: {}, // No updates needed if found
            create: {
              email: token.email as string,
              name: token.name as string,
              image: token.picture as string,
              role: "default" // Default role for new users
            },
            select: { 
              id: true,
              role: true 
            }
          });
          
          // Update token with database ID and role
          token.id = dbUser.id;
          token.role = dbUser.role;
          console.log(`User ${token.email} has role: ${token.role}`);
        } catch (error) {
          console.error("Error fetching/creating user in database:", error);
          token.role = "default"; // Default role on error
        }
      }
      
      return token;
    },

    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.email = token.email as string;
        session.user.role = token.role as string || "default";
        console.log(`Session created for ${session.user.email} with role: ${session.user.role}`);
      }
      return session;
    },

    async redirect({ url, baseUrl }) {
      // If callback URL is provided, respect it, otherwise go to home
      return url.startsWith(baseUrl) ? url : baseUrl;
    },

    async authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isAuthPage = nextUrl.pathname.startsWith("/signup");
      const isDashboardPage = nextUrl.pathname.startsWith("/dashboard");

      if (isLoggedIn && isAuthPage) {
        return Response.redirect(new URL("/dashboard", nextUrl));
      }

      if (!isLoggedIn && isDashboardPage) {
        return Response.redirect(new URL("/login", nextUrl));
      }

      return true;
    }
  },

  pages: {
    signIn: "/login",
    error: "/",
  },

  // Allow all hosts - required for PWA support
  trustHost: true,

  debug: process.env.NODE_ENV === "development",
});
