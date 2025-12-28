import * as React from "react";
import { Suspense } from "react";

import LoginClient from "./login-client";

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-dvh flex items-center justify-center p-6">
          <div className="w-full max-w-md" />
        </main>
      }
    >
      <LoginClient />
    </Suspense>
  );
}
