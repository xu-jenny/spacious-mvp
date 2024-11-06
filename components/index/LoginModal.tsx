// components/LoginModal.tsx
import React, { useState } from "react";
import { supabaseClient } from "@/clients/supabase";
import { useRouter } from "next/navigation";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { useAuthStateContext } from "@/components/AuthStateContext";
import ResetPasswordModal from "./ResetPasswordModal"; // Import ResetPasswordModal

interface LoginModalProps {
  onClose: () => void;
  onLogin: () => void; // Callback function to close the modal after login
}

const LoginModal: React.FC<LoginModalProps> = ({ onClose, onLogin }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showResetPassword, setShowResetPassword] = useState(false); // Track reset password modal visibility
  const router = useRouter();
  const { setSession, setRole } = useAuthStateContext();

  const handleLogin = async () => {
    const {
      error,
      data: { session },
    } = await supabaseClient.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
    } else if (session) {
      setSession(session);
      const { data, error: roleError } = await supabaseClient
        .from("user_roles")
        .select("role")
        .eq("id", session.user.id)
        .single();

      if (!roleError && data) {
        setRole(data.role);
      } else {
        setRole(null);
      }

      onLogin();
      router.push("/app");
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="relative bg-white p-6 rounded-lg shadow-md max-w-sm w-full">
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
        >
          &times;
        </button>

        <div className="flex justify-center mb-4">
          <img src="/logo.jpeg" alt="Logo" className="h-8" />
        </div>
        <h2 className="text-center text-xl font-semibold mb-2">
          Log in to Spacious AI
        </h2>

        <div className="mb-2">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-lg"
          />
        </div>
        <div className="mb-2 relative">
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-lg"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute inset-y-0 right-2 flex items-center text-gray-500 hover:text-gray-700"
          >
            {showPassword ? <FaEyeSlash /> : <FaEye />}
          </button>
        </div>

        {error && <p className="text-red-500 text-sm mb-2">{error}</p>}

        <button
          onClick={handleLogin}
          className="text-white w-full bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-4 py-2 mb-4"
        >
          Log in
        </button>

        <div className="text-center text-sm text-gray-500">
          <button
            onClick={() => setShowResetPassword(true)}
            className="hover:text-blue-600 underline"
          >
            Forgot password?
          </button>
        </div>
      </div>

      {showResetPassword && (
        <ResetPasswordModal onClose={() => setShowResetPassword(false)} />
      )}
    </div>
  );
};

export default LoginModal;
