"use client";

import { StateProvider } from "@/app/StateContext";
import { AuthStateProvider } from "@/components/AuthStateContext";

export default function ClientWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthStateProvider>
      <StateProvider>{children}</StateProvider>
    </AuthStateProvider>
  );
}
