import NextAuth, { CredentialsSignin } from "next-auth";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import { MongoDBAdapter } from "@auth/mongodb-adapter";
import type { Adapter } from "next-auth/adapters";
import { encode, decode } from "next-auth/jwt";
import MicrosoftEntraID from "next-auth/providers/microsoft-entra-id";
import User from "@/model/User";
import bcrypt from "bcryptjs";
import client from "./lib/db";
import { updateUser, generateUsername } from "@/actions/User";

class InvalidLoginError extends CredentialsSignin {
  code = "Email or password are incorrect.";
}

class ThirdPartyOAuthError extends CredentialsSignin {
  code =
    "This account was created with Google or Georgia Tech. Please sign in using that method.";
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: MongoDBAdapter(client) as Adapter,
  session: {
    strategy: "jwt",
  },
  jwt: { encode, decode },
  providers: [
    Google({ allowDangerousEmailAccountLinking: true }),
    MicrosoftEntraID({
      clientId: process.env.AUTH_MICROSOFT_ENTRA_ID,
      clientSecret: process.env.AUTH_MICROSOFT_ENTRA_ID_SECRET,
      issuer: `https://login.microsoftonline.com/${process.env.AUTH_MICROSOFT_ENTRA_ID_TENANT_ID}/v2.0`,
    }),
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
          throw new InvalidLoginError();
        }

        const user = await User.findOne({ email: credentials.email });

        if (!user) {
          throw new InvalidLoginError();
        }

        if (!user.password) {
          throw new ThirdPartyOAuthError();
        }

        const isMatch = await bcrypt.compare(
          credentials.password,
          user.password,
        );

        if (!isMatch) {
          throw new InvalidLoginError();
        }

        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { password, _id, ...userWithoutPassword } = user.toObject();
        return { id: user._id.toString(), ...userWithoutPassword };
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
            const username = await generateUsername(user.email);
            const updateResult = await updateUser(token.sub.toString(), {
              username,
            });
            if (updateResult.error) {
              console.error("Failed to set username:", updateResult.error);
            } else {
              token.username = username;
            }
          } else {
            token.username = dbUser.username;
            token.image = dbUser.image;
          }
        }
      }

      if (trigger === "update") {
        const dbUser = await User.findById(token.sub);
        if (dbUser) {
          token.name = dbUser.name;
          token.username = dbUser.username;
          token.image = dbUser.image;
        }
      }

      return token;
    },
    session({ session, token }) {
      if (token.sub) {
        session.user._id = token.sub;
        session.user.name = token.name;
        session.user.username = token.username;
        session.user.image = token.image as string | null | undefined;
      }
      return session;
    },
  },
});
