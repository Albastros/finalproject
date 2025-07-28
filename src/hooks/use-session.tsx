import { authClient } from "@/lib/auth/auth-client";

export const useSession = () => {
  return authClient.useSession();
};
