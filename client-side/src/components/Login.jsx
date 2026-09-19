import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { login } from "../services/api";
import { supabase } from "../services/supabaseClient";
import "./Login.css";
import Image from "../assets/aboutImg.png";
import google from "../assets/google-logo.png";

function Login({ setIsAuthenticated, setUserRole }) {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Google login via Supabase OAuth redirect
  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo: window.location.origin },
      });
      if (error) throw error;
    } catch (err) {
      setError(err.message || "Google Login failed");
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const data = await login(formData);
      localStorage.setItem("token", data.token);
      localStorage.setItem("profilePic", data.profilePic);
      localStorage.setItem("role", data.role);
      setIsAuthenticated(true);
      if (setUserRole) setUserRole(data.role);
      window.dispatchEvent(new Event("storage"));
      // Navigate to admin panel if admin, else home
      navigate(data.role === 'admin' ? '/admin' : '/');
    } catch (err) {
      setError(err.message || "Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <img className="login-img" src={Image} alt="Login Illustration" />

      <div className="login-form">
        <div className="one">
          <p>
            <span className="create">Create your account</span> to continue to blood donation
          </p>
          <button className="login-google" type="button" onClick={handleGoogleLogin} disabled={loading}>
            <img src={google} alt="Google Logo" />
            Continue with Google
          </button>
        </div>

        <div><hr /></div>

        <form onSubmit={handleLogin}>
          <label>Email address</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
          />

          <label>Password</label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
          />

          <div style={{ textAlign: "right", marginTop: "5px" }}>
            <Link to="/forgot-password" style={{ fontSize: "12px", color: "#E21B1B", textDecoration: "none" }}>
              Forgot Password?
            </Link>
          </div>

          {error && <p className="error">{error}</p>}

          <button type="submit" disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </button>

          <p>
            Don't have an account? <Link className="in" to="/signup">Sign up</Link>
          </p>
        </form>
      </div>
    </div>
  );
}

export default Login;
