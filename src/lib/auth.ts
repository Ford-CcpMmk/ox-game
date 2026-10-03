import { prismaAdapter } from "@better-auth/prisma-adapter";
import { betterAuth } from "better-auth/minimal";
import { prisma } from "@/lib/prisma";

export const auth = betterAuth({
  appName: "OX Game",
  baseURL: process.env.BETTER_AUTH_URL,
  secret: process.env.BETTER_AUTH_SECRET,
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID ?? "missing-google-client-id",
      clientSecret:
        process.env.GOOGLE_CLIENT_SECRET ?? "missing-google-client-secret",
    },
    facebook: {
      clientId: process.env.FACEBOOK_CLIENT_ID ?? "missing-facebook-client-id",
      clientSecret:
        process.env.FACEBOOK_CLIENT_SECRET ?? "missing-facebook-client-secret",
    },
  },
  advanced: {
    database: {
      joins: true,
    },
  },
});
