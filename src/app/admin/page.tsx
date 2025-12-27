'use client'
import { authClient } from "@/lib/auth-client";

export default function Page() {
    const {useSession} = authClient
  return <div>Admin Page

    <pre>{JSON.stringify(useSession(), null, 2)}</pre>
  </div>;
}