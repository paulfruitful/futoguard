import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { upsertFutoUser } from "./actions";

export const { handlers, signIn, signOut, auth } = NextAuth({
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
      authorize: async (credentials) => {
        const { email, password } = credentials || {};
        if (!email || !password) return null;

        try {
          // Step 1: Authenticate with FUTO
          const authRes = await fetch("https://schmgrfuto.azurewebsites.net/api/Authentication/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ userName: email, password }),
          });

          const authData = await authRes.json();
          if (!authData.success) return null;

          const token = authData.data.jwtToken.token;

          // Step 2: Fetch student profile
          const profileRes = await fetch("https://schmgrfuto.azurewebsites.net/api/Student/student-profile", {
            headers: { Authorization: `Bearer ${token}` },
          });

          const profileData = await profileRes.json();
          if (!profileData.success) return null;

          const { personalData, programmeDetail } = profileData.data;

          // Step 3: Upsert into local DB (create if not exists)
          const user = await upsertFutoUser({
            email: personalData.email,
            name: personalData.fullname,
            image: personalData.passport,
            studentId: programmeDetail.matricNumber,
            phoneNumber: personalData.mobileNumber,
            gender: personalData.gender,
            address: personalData.contactAddress,
            department: programmeDetail.department,
          });

          // Must return at least `id`
          return {
            id: user.id,
            name: user.name,
            email: user.email,
            image: user.image,
            role: user.role,
            department: user.department,
            gender: user.gender,
            // needsOnboarding: user.needsOnboarding,
          };
        } catch (err) {
          console.error("FUTO auth error:", err);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === "credentials") {
        return !!user;
      }
      return true;
    },

    async jwt({ token, user, trigger, session }) {
      if (trigger === "update" && session?.user) {
        token.name = session.user.name;
        token.department = session.user.department;
        token.gender = session.user.gender;
        token.needsOnboarding = session.user.needsOnboarding;
      } else if (user) {
        token.id = user.id;
        token.name = user.name;
        token.email = user.email;
        token.image = user.image;
        token.role = user.role;
        token.department = user.department;
        token.gender = user.gender;
        token.needsOnboarding = user.needsOnboarding;
      }

      return token;
    },

    async session({ session, token }) {
      if (token?.id) {
        session.user.id = token.id;
        session.user.name = token.name;
        session.user.email = token.email;
        session.user.image = token.image;
        session.user.role = token.role;
        session.user.department = token.department;
        session.user.gender = token.gender;
        session.user.needsOnboarding = token.needsOnboarding;
      }

      return session;
    },
  },
  secret: process.env.AUTH_SECRET,
});
