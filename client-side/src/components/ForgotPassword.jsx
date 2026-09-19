import React, { useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../services/supabaseClient";
import "./ForgotPassword.css";
import Image from "../assets/aboutImg.png";

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleForgot = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) throw error;
      setMessage("✅ Password reset email sent! Please check your inbox and click the link to reset your password.");
    } catch (err) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <img className="login-img" src={Image} alt="Illustration" />

      <div className="login-form">
        <div className="one">
          <h2>Forgot Password</h2>
          <p>Enter your email and we'll send you a reset link.</p>
        </div>

        <div><hr /></div>

        <form onSubmit={handleForgot}>
          <label>Email address</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="Enter your email"
          />

          {error && <p className="error">{error}</p>}
          {message && <p style={{ color: "green", fontSize: "14px", marginTop: "10px" }}>{message}</p>}

          <button type="submit" disabled={loading}>
            {loading ? "Sending..." : "Send Reset Email"}
          </button>

          <p>
            Remembered your password? <Link className="in" to="/login">Login</Link>
          </p>
        </form>
      </div>
    </div>
  );
}

export default ForgotPassword;
