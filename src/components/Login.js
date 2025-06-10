import React, { useState } from "react";
import logo from "../assets/logo.png";

export default function Login({ onLogin }) {
   const [email, setEmail] = useState("");
   const [password, setPassword] = useState("");
   const [rememberMe, setRememberMe] = useState(false);
   const [error, setError] = useState("");
   const [showReset, setShowReset] = useState(false);
   const [resetEmail, setResetEmail] = useState("");
   const [resetMessage, setResetMessage] = useState("");

   const validateEmail = (email) => /^\S+@\S+\.\S+$/.test(email);

   const handleSubmit = (e) => {
      e.preventDefault();
      if (!validateEmail(email)) {
         setError("Please enter a valid email address");
         return;
      }
      if (password.length === 0) {
         setError("Please enter your password");
         return;
      }
      setError("");
      onLogin();
   };

   const handleResetSubmit = (e) => {
      e.preventDefault();
      if (!validateEmail(resetEmail)) {
         setResetMessage("Please enter a valid email address");
         return;
      }
      setResetMessage(
         `If an account exists for ${resetEmail}, you will receive a password reset email shortly.`
      );
   };

   return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100 px-4">
         {!showReset ? (
            <form
               onSubmit={handleSubmit}
               className="bg-white p-8 rounded shadow-md w-full max-w-md">
               <img src={logo} alt="Logo" className="mx-auto mb-6 w-24" />
               <h2 className="text-3xl font-semibold mb-6 text-center">Log In</h2>

               {error && <p className="text-red-600 mb-4 text-center">{error}</p>}

               <div className="mb-5">
                  <label htmlFor="email" className="block mb-2 text-gray-700 font-medium">
                     Email:
                  </label>
                  <input
                     id="email"
                     type="email"
                     placeholder="you@example.com"
                     value={email}
                     onChange={(e) => setEmail(e.target.value)}
                     className="w-full px-4 py-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-500"
                     required
                  />
               </div>

               <div className="mb-5">
                  <label htmlFor="password" className="block mb-2 text-gray-700 font-medium">
                     Password:
                  </label>
                  <input
                     id="password"
                     type="password"
                     placeholder="Enter your password"
                     value={password}
                     onChange={(e) => setPassword(e.target.value)}
                     className="w-full px-4 py-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-500"
                     required
                  />
               </div>

               <div className="flex items-center justify-between mb-6">
                  <label className="inline-flex items-center text-gray-700">
                     <input
                        type="checkbox"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        className="form-checkbox h-5 w-5 text-green-600"
                     />
                     <span className="ml-2">Remember me</span>
                  </label>
                  <button
                     type="button"
                     onClick={() => {
                        setShowReset(true);
                        setResetMessage("");
                        setResetEmail("");
                     }}
                     className="text-green-600 hover:underline text-sm focus:outline-none">
                     Forgot password?
                  </button>
               </div>

               <button
                  type="submit"
                  className="w-full bg-green-600 text-white py-3 rounded hover:bg-green-700 transition font-semibold">
                  Log In
               </button>
            </form>
         ) : (
            <form
               onSubmit={handleResetSubmit}
               className="bg-white p-8 rounded shadow-md w-full max-w-md">
               <h2 className="text-2xl font-semibold mb-6 text-center text-green-700">
                  Reset Password
               </h2>

               <p className="mb-4 text-center text-gray-700">
                  Enter your email address below and we’ll send you instructions to reset your
                  password.
               </p>

               <input
                  type="email"
                  placeholder="you@example.com"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded mb-4 focus:outline-none focus:ring-2 focus:ring-green-500"
                  required
               />

               {resetMessage && <p className="mb-4 text-center text-green-600">{resetMessage}</p>}

               <div className="flex justify-between">
                  <button
                     type="button"
                     onClick={() => setShowReset(false)}
                     className="px-4 py-2 border rounded hover:bg-gray-100 transition">
                     Back to Login
                  </button>

                  <button
                     type="submit"
                     className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700 transition">
                     Send Reset Link
                  </button>
               </div>
            </form>
         )}
      </div>
   );
}
