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
  role: number; // Set role type to number with a default of 0
  setSession: (session: Session | null) => void;
  setRole: (role: number) => void;
};

const AuthStateContext = createContext<AuthStateContextProps | undefined>(
  undefined
);

export const AuthStateProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [session, setSession] = useState<Session | null>(null);
  const [role, setRole] = useState<number>(0); // Set initial role to 0

  useEffect(() => {
    const { data: authListener } = supabaseClient.auth.onAuthStateChange(
      (event, session) => {
        console.time("Set session");
        setSession(session);
        console.timeEnd("Set session");

        if (session) {
          console.time("Fetch user role");
          supabaseClient
            .from("user_roles")
            .select("role")
            .eq("id", session.user.id)
            .single()
            .then(({ data, error }) => {
              console.timeEnd("Fetch user role");
              console.time("Set role");
              setRole(!error && data ? parseInt(data.role, 10) : 0); // Default to 0 if no role is found
              console.timeEnd("Set role");
            });
        } else {
          console.time("Set role to 0");
          setRole(0); // Set role to 0 if no session
          console.timeEnd("Set role to 0");
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
