import React, { useState, useEffect } from "react";
import { supabaseClient } from "@/clients/supabase";
import { useRouter } from "next/navigation";
import { useAuthStateContext } from "@/components/AuthStateContext";
import LoginModal from "./LoginModal";
import SignUpModal from "./SignupModal";

export const UserStatus = () => {
  const { session, role, setSession, setRole } = useAuthStateContext();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showSignUpModal, setShowSignUpModal] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Fetch initial session and role
    supabaseClient.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session);
      if (session) {
        const { data, error } = await supabaseClient
          .from("user_roles")
          .select("role")
          .eq("id", session.user.id)
          .single();

        if (!error && data) {
          setRole(data.role);
          console.log("Fetched role from Supabase:", data.role);
          console.log("User email:", session.user.email);
        }
      }
    });

    // Listen for session changes
    const { data: authListener } = supabaseClient.auth.onAuthStateChange(
      async (_event, session) => {
        setSession(session);
        if (session) {
          const { data, error } = await supabaseClient
            .from("user_roles")
            .select("role")
            .eq("id", session.user.id)
            .single();

          if (!error && data) {
            setRole(data.role);
            console.log("User role:", data.role);
            console.log("User email:", session.user.email);
          }
        } else {
          setRole(0);
          console.log("User signed out");
          router.refresh();
        }
      }
    );

    return () => authListener.subscription.unsubscribe();
  }, [setSession, setRole, router]);

  const handleLogout = async () => {
    console.log("Attempting to log out...");
    const { error } = await supabaseClient.auth.signOut();
    if (error) {
      console.error("Logout error:", error.message);
    } else {
      setSession(null);
      setRole(0);
      console.log("User logged out successfully");
      router.refresh();
    }
  };

  return (
    <div className="p-4 text-center">
      {session ? (
        <>
          <p className="mb-1 text-sm text-gray-600">
            Logged in as: <strong>{session.user.email}</strong>
          </p>
          {/* Display role only if the user is an admin */}
          {/* {role === 10 && (
            <p className="mb-1 text-sm text-blue-600">
              Role: <strong>Admin</strong>
            </p>
          )} */}
          <button
            className="text-gray-700 bg-white border border-gray-300 py-2 px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-opacity-50 hover:bg-gray-100"
            onClick={handleLogout}
          >
            Log Out
          </button>
        </>
      ) : (
        <>
          <button
            className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-4 py-2 mr-2"
            onClick={() => setShowLoginModal(true)}
          >
            Log In
          </button>
          <button
            className="text-gray-700 bg-white border border-gray-300 focus:ring-2 focus:outline-none focus:ring-gray-300 font-medium rounded-lg text-sm px-4 py-2 hover:bg-gray-100"
            onClick={() => setShowSignUpModal(true)}
          >
            Sign Up
          </button>
        </>
      )}

      {showLoginModal && (
        <LoginModal
          onClose={() => setShowLoginModal(false)}
          onLogin={() => setShowLoginModal(false)}
        />
      )}

      {showSignUpModal && (
        <SignUpModal
          onClose={() => setShowSignUpModal(false)}
          onSignUpSuccess={() => {
            setShowSignUpModal(false);
            // setShowLoginModal(true); // Automatically open login modal on successful signup
          }}
        />
      )}
    </div>
  );
};
