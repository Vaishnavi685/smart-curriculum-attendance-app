import React, { useState } from "react";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "../firebase";
import "./ResetPassword.css";  // naya css use karo


export default function ResetPassword() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const handleReset = async () => {
    if (!email) {
      setMessage("⚠️ Please enter your email.");
      return;
    }
    try {
      await sendPasswordResetEmail(auth, email);
      setMessage("✅ Password reset link has been sent to your email.");
    } catch (error) {
      console.error("Reset error:", error);
      setMessage("❌ Could not send reset link. Please try again.");
    }
  };

  return (
    <div className="reset-container">
      <div className="reset-box">
        <h2>Reset Password</h2>
        <p>Enter your registered email to receive a reset link</p>

        <input
          type="email"
          className="reset-input"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <button className="reset-btn" onClick={handleReset}>
          Send Reset Link
        </button>

        {message && <p className="message">{message}</p>}

        <p className="back-link" onClick={() => window.history.back()}>
          ← Back to Login
        </p>
      </div>
    </div>
  );
}


