import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Login.css";


import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "../firebase";

export default function Signup() {
  
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "student" });
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.name && form.email && form.password) {
      try {
        
        const userCredential = await createUserWithEmailAndPassword(auth, form.email, form.password);
        const user = userCredential.user;

        await setDoc(doc(db, "users", user.uid), {
          name: form.name,
          email: user.email,
          role: form.role, 
        });

        alert("✅ Account created successfully!");
        navigate("/dashboard");
      } catch (error) {
        alert(`❌ Error creating account: ${error.message}`);
      }
    } else {
      alert("❌ Please fill all fields");
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
          Create your <span className="highlight">ScheduPlan</span> account
        </h1>
      </div>

      <form className="login-form" onSubmit={handleSubmit}>
        {/* Name, Email, and Password fields remain the same */}
        <div className="input-group">
          <label>Name</label>
          <input
            type="text"
            placeholder="Your Name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
          />
        </div>

        <div className="input-group">
          <label>Email address</label>
          <input
            type="email"
            placeholder="your-email@example.com"
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

        {/* --- THIS IS THE ROLE SELECTION SECTION --- */}
        <div className="input-group">
          <label>I am a:</label>
          <div style={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'center', marginTop: '5px' }}>
            <label style={{ marginRight: '20px', display: 'flex', alignItems: 'center' }}>
              <input
                type="radio"
                value="student"
                name="role"
                checked={form.role === 'student'}
                onChange={(e) => setForm({ ...form, role: e.target.value })}
                style={{ marginRight: '5px' }}
              />
              Student
            </label>
            <label style={{ display: 'flex', alignItems: 'center' }}>
              <input
                type="radio"
                value="teacher"
                name="role"
                checked={form.role === 'teacher'}
                onChange={(e) => setForm({ ...form, role: e.target.value })}
                style={{ marginRight: '5px' }}
              />
              Teacher
            </label>
          </div>
        </div>
        {/* --- END OF ROLE SELECTION SECTION --- */}

        <button type="submit" className="btn-primary">
          Sign Up
        </button>

        <p style={{ marginTop: '15px' }}>
          Already have an account?{" "}
          <span
            style={{ color: "#075eec", cursor: "pointer" }}
            onClick={() => navigate("/")}
          >
            Sign In
          </span>
        </p>
      </form>
    </div>
  );
}

