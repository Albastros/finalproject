import { auth } from "./auth";
import { authClient } from "./auth-client";

export const githubSignin = async () => {
  await authClient.signIn.social({
    provider: "github",
    callbackURL: "/",
  });
};

export const googleSignin = async () => {
  await authClient.signIn.social({
    provider: "google",
    callbackURL: "/",
  });
};

// TODO: Add other social providers 
