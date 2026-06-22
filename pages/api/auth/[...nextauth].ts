// @ts-nocheck

import NextAuth, { AuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { signInWithEmailAndPassword } from 'firebase/auth'
import { auth, db } from '@/lib/firebase' // Pastikan db sudah di-import
import { doc, getDoc } from 'firebase/firestore'
import { isAdminRole } from '@/lib/roles'

export const authOptions: AuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: 'jwt',
  },
  pages: {
    signIn: '/signin',
  },
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {},
      async authorize(credentials, req) {
        return await signInWithEmailAndPassword(
          auth,
          (credentials as any).email || '',
          (credentials as any).password || '',
        )
          .then(async (userCredential) => {
            if (userCredential.user) {
              // 🔹 Ambil data user dari Firestore untuk mendapatkan role
              const userDocRef = doc(db, 'users', userCredential.user.uid)
              const userDoc = await getDoc(userDocRef)
              
              if (userDoc.exists()) {
                const userData = userDoc.data()
                const role = userData.role || 'user'

                if (!isAdminRole(role)) {
                  return null
                }

                return {
                  uid: userCredential.user.uid,
                  email: userCredential.user.email,
                  role,
                  ...userCredential.user
                }
              } else {
                return null
              }
            }
            return null
          })
          .catch((error) => {
            console.log(error)
            return null
          })
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.uid = user.uid
        token.role = user.role // 🔹 Tambahkan role ke token
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.uid = token.uid
        session.role = token.role // 🔹 Tambahkan role ke session
      }
      return session
    },
  },
}

export default NextAuth(authOptions)