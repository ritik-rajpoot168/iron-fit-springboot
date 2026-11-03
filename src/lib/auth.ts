import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";

const apiUrl = process.env.IRONFIT_API_URL || "http://localhost:8080";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
      ? [Google({ clientId: process.env.GOOGLE_CLIENT_ID, clientSecret: process.env.GOOGLE_CLIENT_SECRET })]
      : []),
    Credentials({
      name: "credentials",
      credentials: { email: { label: "Email", type: "email" }, password: { label: "Password", type: "password" } },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        const response = await fetch(`${apiUrl}/api/auth/login`, {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: credentials.email, password: credentials.password }), cache: "no-store",
        }).catch(() => null);
        if (!response?.ok) return null;
        const payload = await response.json();
        const user = payload.user;
        return user?.id ? { id: user.id, name: user.name, email: user.email, role: user.role ?? "user" } : null;
      },
    }),
  ],
  session: { strategy: "jwt" },
  pages: { signIn: "/login", error: "/login" },
  callbacks: {
    async jwt({ token, user, account }) {
      if (account?.provider === "google" && user?.email) {
        const bridge = process.env.IRONFIT_BRIDGE_SECRET;
        if (!bridge) throw new Error("IRONFIT_BRIDGE_SECRET is required for Google sign-in");
        const response = await fetch(`${apiUrl}/api/auth/oauth`, {
          method: "POST",
          headers: { "Content-Type": "application/json", "X-Ironfit-Bridge": bridge },
          body: JSON.stringify({ email: user.email, name: user.name, image: user.image, subject: account.providerAccountId }),
          cache: "no-store",
        });
        if (!response.ok) throw new Error("Could not sync Google account with IRON.FIT");
        const payload = await response.json();
        token.id = payload.user.id;
        token.role = payload.user.role ?? "user";
      } else if (user?.id) {
        token.id = user.id;
        token.role = (user as typeof user & { role?: string }).role ?? "user";
      }
      return token;
    },
    async session({ session, token }) {
      if (token.id && session.user) {
        session.user.id = String(token.id);
        session.user.role = token.role === "admin" ? "admin" : "user";
      }
      return session;
    },
  },
});
