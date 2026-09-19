import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../services/supabaseClient";
import "./ForgotPassword.css";
import Image from "../assets/aboutImg.png";

function ResetPassword() {
  const [newPassword, setNewPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Supabase sets up session via URL hash after clicking reset link
    supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") {
        setReady(true);
      }
    });
  }, []);

  const handleReset = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
      setMessage("✅ Password reset successfully! Redirecting to login...");
      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      setError(err.message || "Failed to reset password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <img className="login-img" src={Image} alt="Illustration" />

      <div className="login-form">
        <div className="one">
          <h2>Reset Password</h2>
          <p>
            {ready
              ? "Enter your new password below."
              : "Please click the reset link from your email first."}
          </p>
        </div>

        <div><hr /></div>

        {ready ? (
          <form onSubmit={handleReset}>
            <label>New Password</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              placeholder="Enter new password"
              minLength={6}
            />

            {error && <p className="error">{error}</p>}
            {message && <p style={{ color: "green", fontSize: "14px", marginTop: "10px" }}>{message}</p>}

            <button type="submit" disabled={loading}>
              {loading ? "Resetting..." : "Reset Password"}
            </button>
          </form>
        ) : (
          <p style={{ textAlign: "center", color: "#666" }}>
            Click the link in your email to reset your password.
          </p>
        )}

        <p>
          Back to <Link className="in" to="/login">Login</Link>
        </p>
      </div>
    </div>
  );
}

export default ResetPassword;
