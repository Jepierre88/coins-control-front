import { ActionResponseEntity } from "@/types/action-response.entity";
import { authClient } from "./auth-client";
import { AppUser } from "@/types/auth-types.entity";

export const handleLogin = async ({
  identificationNumber,
  password,
}: { identificationNumber: string; password: string }): Promise<ActionResponseEntity<AppUser>> => {
  const res = await authClient.$fetch<ActionResponseEntity<AppUser>>("/credentials/sign-in", {
    method: "POST",
    body: { identificationNumber, password },
  });
  
  const {data} = res;

  if(!data?.success){
    throw new Error(data?.message);
  }
  return data

};
