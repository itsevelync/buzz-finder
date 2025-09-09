import NextAuth, { CredentialsSignin } from "next-auth"
import Google from "next-auth/providers/google"
import Credentials from "next-auth/providers/credentials"
import { MongoDBAdapter } from "@auth/mongodb-adapter"
import { encode, decode } from 'next-auth/jwt';

import User from "@/model/User";
import bcrypt from "bcryptjs";
import client from "./lib/db";

class InvalidLoginError extends CredentialsSignin {
    code = "Email or password are incorrect."
}

class GoogleOAuthError extends CredentialsSignin {
    code = "This account was created with Google authentication. Please continue by signing in with Google."
}

export const { handlers, signIn, signOut, auth } = NextAuth({
    adapter: MongoDBAdapter(client),
  session: {
    strategy: 'jwt',
  },
  jwt: { encode, decode },
    providers: [
        Google,
        Credentials({
            credentials: {
                email: { label: "Email", type: "text" },
                password: { label: "Password", type: "password" },
            },
            authorize: async (credentials) => {
                if (
                    !credentials ||
                    typeof credentials.email !== "string" ||
                    typeof credentials.password !== "string"
                ) {
                    throw new InvalidLoginError()
                }

                const user = await User.findOne({ email: credentials.email });

                if (!user) {
                    throw new InvalidLoginError()
                }

                if (!user.password) {
                    throw new GoogleOAuthError()
                }

                const isMatch = await bcrypt.compare(credentials.password, user.password);

                if (!isMatch) {
                    throw new InvalidLoginError()
                }

                const { password, ...userWithoutPassword } = user.toObject();
                return userWithoutPassword;
            },
        }),

    ],
    pages: {
        signIn: "/login",
    },
})