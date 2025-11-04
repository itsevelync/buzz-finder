import NextAuth, { CredentialsSignin } from "next-auth"
import Google from "next-auth/providers/google"
import Credentials from "next-auth/providers/credentials"
import { MongoDBAdapter } from "@auth/mongodb-adapter"
import type { Adapter } from 'next-auth/adapters';
import { encode, decode } from 'next-auth/jwt';

import User from "@/model/User";
import bcrypt from "bcryptjs";
import client from "./lib/db";
import { updateUser, generateUsername } from "@/actions/User";

class InvalidLoginError extends CredentialsSignin {
    code = "Email or password are incorrect."
}

class GoogleOAuthError extends CredentialsSignin {
    code = "This account was created with Google authentication. Please continue by signing in with Google."
}

export const { handlers, signIn, signOut, auth } = NextAuth({
    adapter: MongoDBAdapter(client) as Adapter,
    session: {
        strategy: 'jwt',
    },
    jwt: { encode, decode },
    providers: [
        Google({ allowDangerousEmailAccountLinking: true }),
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
                
                const userObj = user.toObject();
                delete userObj.password;
                return userObj;
            },
        }),


    ],
    pages: {
        signIn: "/login",
    },
    callbacks: {
        async jwt({ token, user, trigger }) {
            if (user) {
                token.name = user.name;

                const dbUser = await User.findById(token.sub);
                if (dbUser && token.sub) {
                    // If user logs in with Google and doesn't have a username, generate one
                    if (!dbUser.username && user.email) {
                        const username = await generateUsername(user.email)
                        const updateResult = await updateUser(token.sub.toString(), { username });
                        if (updateResult.error) {
                            console.error("Failed to set username:", updateResult.error);
                        } else {
                            token.username = username;
                        }
                    } else {
                        token.username = dbUser.username;
                    }
                }
            }

            if (trigger === "update") {
                const dbUser = await User.findById(token.sub);
                if (dbUser) {
                    token.name = dbUser.name;
                    token.username = dbUser.username;
                }
            }

            return token;
        },
        session({ session, token }) {
            if (token.sub) {
                session.user._id = token.sub;
                session.user.name = token.name;
                session.user.username = token.username;
            }
            return session;
        },
    },
})