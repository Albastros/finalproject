import { createAuthClient } from "better-auth/react";
import { inferAdditionalFields } from "better-auth/client/plugins";

import { auth } from "./auth";
// type for auth client if incase not properly configured.
type BAClient = ReturnType<typeof createAuthClient>;
export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  plugins: [inferAdditionalFields<typeof auth>()],
  fetchOptions: {
    credentials: "include",
  },
});

const { useSession, signOut } = authClient;
