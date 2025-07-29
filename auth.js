// lib/auth.ts

import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { upsertFutoUser } from "./lib/actions";
// import type { NextAuthConfig } from "next-auth"

export const authConfig = {
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/auth/signin",
  },
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        studentId: { label: "Student ID", type: "text" },
      },
      async authorize(credentials) {
        const { email, password } = credentials || {};
        if (!email || !password) return null;

        try {
          // Step 1: Authenticate with FUTO portal
          const authRes = await fetch(
            "https://schmgrfuto.azurewebsites.net/api/Authentication/login",
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ userName: email, password }),
            }
          );

          const authData = await authRes.json();
          console.log("Authentication passed -->:", authData.success);
          if (!authData.success) return null;

          console.log("User validated by futo portal");
          const token = authData.data.jwtToken.token;

          // Step 2: Fetch student profile
          const profileRes = await fetch(
            "https://schmgrfuto.azurewebsites.net/api/Student/student-profile",
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

          const profileData = await profileRes.json();
          if (!profileData.success) return null;

          console.log("Profile data gotten");
          const { personalData, programmeDetail } = profileData.data;
          const user = await upsertFutoUser(profileData.data);
          return {
            id: user.id,
            email: user.email,
            name: user.fullname,
            username: user.matricNumber,
            role: "USER",
            image: user.passport,
            mobileNumber: user.mobileNumber,
          };
        } catch (err) {
          console.error("FUTO auth error:", err);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.name = user.name;
        token.username = user.username;
        token.email = user.email;
        token.image = user.image;
        token.mobileNumber = user.mobileNumber;
      }
      // Defensive fix to prevent `payload must be object` error
      if (!token || typeof token !== "object") {
        return {};
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id;
        session.user.role = token.role;
        session.user.name = token.name;
        session.user.username = token.username;
        session.user.email = token.email;
        session.user.image = token.image;
        session.user.mobileNumber = token.mobileNumber;
      }
      return session;
    },
  },
  secret: process.env.AUTH_SECRET,
};

// Now export standard helpers
export const { handlers, auth, signIn, signOut } = NextAuth(authConfig);
