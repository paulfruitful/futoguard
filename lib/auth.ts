import type { NextAuthOptions } from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"
import CredentialsProvider from "next-auth/providers/credentials"
import { prisma } from "./prisma"

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        studentId: { label: "Student ID", type: "text" },
      },
      async authorize(credentials) {
        const { email, password } = credentials || {}
        if (!email || !password) return null

        try {
          // Step 1: Authenticate with FUTO portal
          const authRes = await fetch("https://schmgrfuto.azurewebsites.net/api/Authentication/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ userName: email, password }),
          })

          const authData = await authRes.json()
          if (!authData.success) return null

          console.log('Auth data = ', authData)

          const token = authData.data.jwtToken.token

          // Step 2: Fetch student profile
          const profileRes = await fetch("https://schmgrfuto.azurewebsites.net/api/Student/student-profile", {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          })

          const profileData = await profileRes.json()
          if (!profileData.success) return null
          console.log('Profile data = ', profileData)

          const { personalData, programmeDetail } = profileData.data

          // Step 3: Create or find local user in your DB
          // const user = await prisma.user.upsert({
          //   where: { email: personalData.email },
          //   update: {
          //     name: personalData.fullname,
          //     phoneNumber: personalData.mobileNumber,
          //     studentId: programmeDetail.matricNumber,
          //     department: programmeDetail.department,
          //     image: personalData.passport, // base64 image
          //   },
          //   create: {
          //     name: personalData.fullname,
          //     email: personalData.email,
          //     phoneNumber: personalData.mobileNumber,
          //     studentId: programmeDetail.matricNumber,
          //     department: programmeDetail.department,
          //     image: personalData.passport,
          //     role: "USER",
          //   },
          // })

          return {
            id: personalData.id,
            email: personalData.email,
            name: personalData.name,
            role: personalData.role,
          }
        } catch (err) {
          console.error("FUTO auth error:", err)
          return null
        }
      }

    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    jwt: async ({ token, user }) => {
      if (user) {
        token.role = user.role
      }
      return token
    },
    session: async ({ session, token }) => {
      if (token) {
        session.user.id = token.sub!
        session.user.role = token.role as string
      }
      return session
    },
  },
  pages: {
    signIn: "/auth/signin",
  },
}
