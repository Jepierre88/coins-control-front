import { authClient } from "./auth-client";

export const handleLogin = async ({
    identificationNumber,
    password,
}: { identificationNumber: string; password: string }) => {
    authClient.$fetch("/credentials/sign-in", {
      method: "POST",
      body: {
        identificationNumber,
        password,
      },
    }).then(async (data) => {
      console.log("Login successful:", data);
      const session = await authClient.getSession();
      console.log("Current session:", session);
    }).catch((error) => {
      console.error("Login failed:", error);  
    })
  };