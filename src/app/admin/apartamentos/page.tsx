import type { Metadata } from "next";
import ApartamentosView from "./view";

export const metadata: Metadata = {
  title: "Apartamentos",
};

export default function Page() {
  return <ApartamentosView />;
}
