import React, { useState } from "react";
import { supabaseClient } from "@/clients/supabase";
import Image from "next/image";
interface ResetPasswordModalProps {
  onClose: () => void;
}

const ResetPasswordModal: React.FC<ResetPasswordModalProps> = ({ onClose }) => {
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleResetPassword = async () => {
    setEmailError(null);
    setError(null);
    setSuccessMessage(null);

    if (!email) {
      setEmailError("Please enter your email.");
      return;
    }

    const { error } = await supabaseClient.auth.resetPasswordForEmail(email);
    if (error) {
      setError("Failed to send reset email. Please try again.");
    } else {
      setSuccessMessage("Password reset email sent! Please check your inbox.");
    }
  };

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };
  return (
    <div
      className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm z-50"
      onClick={handleOverlayClick}
    >
      <div className="relative bg-white p-6 rounded-lg shadow-md max-w-sm w-full">
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
        >
          &times;
        </button>

        <div className="flex justify-center mb-4">
          <Image
            src="/logo.jpeg"
            alt="Logo"
            width={300}
            height={150}
            className="h-8"
          />
        </div>
        <h2 className="text-center text-xl font-semibold mb-2">
          Reset Your Password
        </h2>
        <p className="text-center text-gray-600 mb-4">
          Enter your email to receive a password reset link.
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
          onClick={handleResetPassword}
          className="text-white w-full bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-4 py-2"
        >
          Send Reset Link
        </button>
      </div>
    </div>
  );
};

export default ResetPasswordModal;
