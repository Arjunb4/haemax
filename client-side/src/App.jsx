import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { supabase } from "./services/supabaseClient";
import Navbar from "./components/Navbar";
import Home from "./components/Home";
import About from "./components/About";
import Bottombg from "./components/Bottombg";
import Form from "./components/Form";
import Login from "./components/Login";
import Signup from "./components/Signup";
import Profile from "./components/Profile";
import Dashboard from "./components/Dashboard";
import ReceiverSearch from "./components/ReceiverSearch";
import ForgotPassword from "./components/ForgotPassword";
import ResetPassword from "./components/ResetPassword";
import MyDonations from "./components/MyDonations";
import DonationRequests from "./components/DonationRequests";
import Explore from "./components/Explore";
import AdminDashboard from "./components/AdminDashboard";

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing Supabase session on load
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setIsAuthenticated(true);
        localStorage.setItem("token", session.access_token);
        // Fetch role from profiles
        supabase
          .from("profiles")
          .select("role, profile_pic, status")
          .eq("id", session.user.id)
          .maybeSingle()
          .then(({ data }) => {
            if (data) {
              localStorage.setItem("role", data.role || "user");
              localStorage.setItem("profilePic", data.profile_pic || "");
            }
          });
      } else {
        setIsAuthenticated(false);
      }
      setLoading(false);
    });

    // Listen for auth state changes (login, logout, OAuth callback)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session) {
          setIsAuthenticated(true);
          localStorage.setItem("token", session.access_token);
          if (event === "SIGNED_IN") {
            const { data: profile } = await supabase
              .from("profiles")
              .select("role, profile_pic, status, fname")
              .eq("id", session.user.id)
              .maybeSingle();

            if (!profile) {
              const meta = session.user.user_metadata || {};
              const newProfile = {
                id: session.user.id,
                fname: meta.fname || meta.given_name || meta.full_name?.split(" ")[0] || "User",
                lname: meta.lname || meta.family_name || meta.full_name?.split(" ").slice(1).join(" ") || "",
                phone: meta.phone || "Not Provided",
                profile_pic: meta.avatar_url || "",
                role: "user",
                status: "active"
              };
              // It's possible `api.js` login already inserted it so we ignore errors here
              await supabase.from("profiles").insert(newProfile);
              localStorage.setItem("role", "user");
              localStorage.setItem("profilePic", newProfile.profile_pic);
            } else {
              localStorage.setItem("role", profile.role || "user");
              localStorage.setItem("profilePic", profile.profile_pic || "");
            }
            window.dispatchEvent(new Event("storage"));
          }
        } else {
          setIsAuthenticated(false);
          localStorage.removeItem("token");
          localStorage.removeItem("role");
          localStorage.removeItem("profilePic");
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("profilePic");
    setIsAuthenticated(false);
  };

  const ProtectedRoute = ({ element }) => {
    return isAuthenticated ? element : <Navigate to="/login" />;
  };

  const AdminRoute = ({ element }) => {
    const role = localStorage.getItem("role");
    return isAuthenticated && role === "admin" ? element : <Navigate to="/" />;
  };

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', fontSize: '18px' }}>Loading...</div>;

  return (
    <BrowserRouter>
      <Navbar isAuthenticated={isAuthenticated} onLogout={handleLogout} />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/explore" element={<Explore />} />
        <Route path="/form" element={<Form />} />
        <Route path="/login" element={<Login setIsAuthenticated={setIsAuthenticated} />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/receiversearch" element={<ReceiverSearch />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        {/* Protected Routes */}
        <Route path="/dashboard" element={<ProtectedRoute element={<Dashboard />} />} />
        <Route path="/profile" element={<ProtectedRoute element={<Profile />} />} />
        <Route path="/donations" element={<ProtectedRoute element={<MyDonations />} />} />
        <Route path="/requests" element={<ProtectedRoute element={<DonationRequests />} />} />

        {/* Admin Routes */}
        <Route path="/admin" element={<AdminRoute element={<AdminDashboard />} />} />
      </Routes>
      <Bottombg />
    </BrowserRouter>
  );
}

export default App;
