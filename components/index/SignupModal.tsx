import React, { useState } from "react";
import { supabaseClient } from "@/clients/supabase";
import { FaEye, FaEyeSlash } from "react-icons/fa";

interface SignUpModalProps {
  onClose: () => void;
  onSignUpSuccess: () => void;
}

const SignUpModal: React.FC<SignUpModalProps> = ({
  onClose,
  onSignUpSuccess,
}) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const checkIfEmailExists = async (email: string) => {
    const { data } = await supabaseClient
      .from("public_user_exists")
      .select("user_id")
      .eq("email", email)
      .single();

    return !!data;
  };

  const handleSignUp = async () => {
    setEmailError(null);
    setError(null);
    setSuccessMessage(null);

    const emailExists = await checkIfEmailExists(email);
    if (emailExists) {
      setEmailError("Account already exists. Please log in.");
      return;
    }

    const { data, error } = await supabaseClient.auth.signUp({
      email,
      password,
    });

    if (error) {
      setEmailError(null); // Clear specific email error
      setError(error.message);
    } else {
      const userId = data.user?.id;
      if (userId) {
        await supabaseClient
          .from("public_user_exists")
          .insert([{ user_id: userId, email }]);
      }
      setSuccessMessage("Signup successful! You can now log in.");
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
          Create Your Account
        </h2>
        <p className="text-center text-gray-600 mb-4">
          Set your password to continue
        </p>

        <div className="mb-2">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setEmailError(null);
              setSuccessMessage(null);
            }}
            className={`w-full p-2 border ${
              emailError ? "border-red-500" : "border-gray-300"
            } rounded-lg`}
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

        {/* Display error or success message in the same position */}
        {emailError && (
          <p className="text-red-500 text-sm mb-2 text-center">{emailError}</p>
        )}
        {error && !emailError && (
          <p className="text-red-500 text-sm mb-2 text-center">{error}</p>
        )}
        {successMessage && (
          <p className="text-green-500 text-sm mb-2 text-center">
            {successMessage}
          </p>
        )}

        <button
          onClick={handleSignUp}
          className="text-white w-full bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-4 py-2 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
        >
          Sign Up
        </button>

        <div className="text-center text-gray-600 mt-4">
          <p>
            Already have an account?{" "}
            <button
              onClick={onSignUpSuccess}
              className="text-blue-500 underline"
            >
              Log in
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignUpModal;
