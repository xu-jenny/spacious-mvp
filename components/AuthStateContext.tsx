// AuthStateContext.tsx
"use client";
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { supabaseClient } from "@/clients/supabase";
import { Session } from "@supabase/supabase-js";

type AuthStateContextProps = {
  session: Session | null;
  role: string | null;
  setSession: (session: Session | null) => void;
  setRole: (role: string | null) => void;
};

const AuthStateContext = createContext<AuthStateContextProps | undefined>(
  undefined
);

export const AuthStateProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [session, setSession] = useState<Session | null>(null);
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    const { data: authListener } = supabaseClient.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);

        if (session) {
          supabaseClient
            .from("user_roles")
            .select("role")
            .eq("id", session.user.id)
            .single()
            .then(({ data, error }) => {
              setRole(!error && data ? data.role : null);
            });
        } else {
          setRole(null);
        }
      }
    );

    return () => authListener.subscription.unsubscribe();
  }, []);

  return (
    <AuthStateContext.Provider value={{ session, role, setSession, setRole }}>
      {children}
    </AuthStateContext.Provider>
  );
};

export const useAuthStateContext = () => {
  const context = useContext(AuthStateContext);
  if (!context)
    throw new Error(
      "useAuthStateContext must be used within an AuthStateProvider"
    );
  return context;
};
