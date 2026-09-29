import type { ReactNode } from "react";
import { Header } from "./Header.js";

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="mx-auto w-full max-w-330 px-6 pt-7 pb-15">
        {children}
      </main>
    </div>
  );
}
