import AppNavbar from "@/components/app-navbar";
import { PropsWithChildren } from "react";

export default function AdminLayout({ children }: PropsWithChildren) {
  return (
    <>
      <AppNavbar />

      <main className="p-2">{children}</main>
    </>
  );
}
