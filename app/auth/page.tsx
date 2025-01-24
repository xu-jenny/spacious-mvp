"use client";

import React, { useState } from "react";
import { supabaseClient } from "@/clients/supabase";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import Image from "next/image";

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleSignUp = async () => {
    setError(null);
    setSuccessMessage(null);

    const { data, error } = await supabaseClient.auth.signUp({
      email,
      password,
    });

    if (error) {
      setError(error.message);
    } else {
      setSuccessMessage(
        "Signup successful! Please check your email to confirm."
      );
    }
  };

  const handleLogin = async () => {
    setError(null);

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
      window.location.href = "/app"; // Redirect after successful login
    }
  };

  const toggleForm = () => {
    setError(null);
    setSuccessMessage(null);
    setIsLogin(!isLogin);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#FFFCF0]">
      {/* Logo at the top */}
      <div className="absolute top-8">
        <Image
          src="/logo_transparent.png"
          alt="Logo"
          width={300}
          height={150}
          className="h-12"
        />
      </div>

      {/* Form Container */}
      <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
        <h1 className="text-3xl font-semibold text-center mb-4">
          {isLogin ? "Log In" : "Sign Up to Get Started"}
        </h1>
        <p className="text-center text-gray-600 font-semibold">
          {isLogin ? "Welcome Back" : "Your Compliance, Simplified"}
        </p>
        <p className="text-center text-gray-600 mb-6">
          {isLogin
            ? "Access your account and explore data instantly."
            : "Access North Carolina's environmental data in seconds."}
        </p>

        {/* Email Input */}
        <div className="mb-4">
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
          />
        </div>

        {/* Password Input */}
        <div className="mb-4 relative">
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute inset-y-0 right-3 flex items-center text-gray-500 hover:text-gray-700"
          >
            {showPassword ? <FaEyeSlash /> : <FaEye />}
          </button>
        </div>

        {/* Error and Success Messages */}
        {error && (
          <p className="text-red-500 text-sm mb-2 text-center">{error}</p>
        )}
        {successMessage && (
          <p className="text-green-500 text-sm mb-4 text-center">
            {successMessage}
          </p>
        )}

        {/* Continue Button */}
        <button
          onClick={isLogin ? handleLogin : handleSignUp}
          className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition mb-4"
        >
          {isLogin ? "Log In" : "Sign Up"}
        </button>

        {/* Footer */}
        <p className="text-center text-sm text-gray-500">
          {isLogin ? "Don’t have an account?" : "Already have an account?"}{" "}
          <button
            onClick={toggleForm}
            className="text-blue-500 hover:underline"
          >
            {isLogin ? "Sign Up" : "Log In"}
          </button>
        </p>
      </div>
    </div>
  );
}
