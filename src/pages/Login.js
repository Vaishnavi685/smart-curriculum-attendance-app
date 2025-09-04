import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Login.css";

import { signInWithEmailAndPassword } from "firebase/auth";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "../firebase";

export default function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.email && form.password) {
      try {
        const userCredential = await signInWithEmailAndPassword(auth, form.email, form.password);
        const user = userCredential.user;

        await addDoc(collection(db, "attendance"), {
          userId: user.uid,
          email: user.email,
          status: "Present",
          timestamp: serverTimestamp()
        });
        
        navigate("/dashboard");

      } catch (error) {
        let errorMessage = "An unexpected error occurred. Please try again.";
        
        // Check the specific error code from Firebase
        switch (error.code) {
          case "auth/invalid-credential":
            errorMessage = "❌ Invalid email or password. Please check your credentials and try again.";
            break;
          case "auth/user-not-found":
            errorMessage = "❌ No account found with this email.";
            break;
          case "auth/wrong-password":
             errorMessage = "❌ Incorrect password. Please try again.";
             break;
             
          default:
            
            console.error("Firebase sign-in error:", error); // Log the technical error for you to see
            break;
        }
        alert(errorMessage);
        
      }
    } else {
      alert("❌ Please enter email and password");
    }
  };


  return (
    <div className="login-container">
      <div className="login-header">
        <img
          className="login-logo"
          src="https://i.ibb.co/wN21Hfgs/logo.png"
          alt="App Logo"
        />
        <h1>
          Sign in to <span className="highlight">ScheduPlan</span>
        </h1>
        <p className="subtitle">Get access to your schedule and more</p>
      </div>

      <form className="login-form" onSubmit={handleSubmit}>
        <div className="input-group">
          <label>Email address</label>
          <input
            type="email"
            placeholder="sushant@gmail.com"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            required
          />
        </div>

        <div className="input-group">
          <label>Password</label>
          <input
            type="password"
            placeholder="********"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            required
          />
        </div>

        <button type="submit" className="btn-primary">
          Sign In
        </button>

        <a href="#" className="forgot-link">
          Forgot password?
        </a>
      </form>
      <p>
        Don’t have an account?{" "}
        <span
          style={{ color: "#075eec", cursor: "pointer" }}
          onClick={() => navigate("/signup")}
        >
          Sign Up
        </span>
      </p>
    </div>
  );
}