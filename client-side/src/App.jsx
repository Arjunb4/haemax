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
  const [userRole, setUserRole] = useState(localStorage.getItem("role") || null);
  const [loading, setLoading] = useState(true);

  const fetchUserProfile = async (user) => {
    if (!user) return null;
    try {
      let { data: profile } = await supabase
        .from("profiles")
        .select("role, profile_pic, status")
        .eq("id", user.id)
        .maybeSingle();

      const isSpecialAdmin = user.email?.toLowerCase().trim() === "arjunbb441@gmail.com";

      if (!profile) {
        const meta = user.user_metadata || {};
        const newProfile = {
          id: user.id,
          fname: meta.fname || meta.given_name || meta.full_name?.split(" ")[0] || "User",
          lname: meta.lname || meta.family_name || meta.full_name?.split(" ").slice(1).join(" ") || "",
          phone: meta.phone || "Not Provided",
          profile_pic: meta.avatar_url || "",
          role: isSpecialAdmin ? "admin" : "user",
          status: "active"
        };
        await supabase.from("profiles").insert(newProfile);
        profile = newProfile;
      } else if (isSpecialAdmin && profile.role !== "admin") {
        await supabase.from("profiles").update({ role: "admin" }).eq("id", user.id);
        profile.role = "admin";
      }

      const role = profile.role || "user";
      const pic = profile.profile_pic || "";
      localStorage.setItem("role", role);
      localStorage.setItem("profilePic", pic);
      setUserRole(role);
      return role;
    } catch (err) {
      console.error("Error fetching user profile:", err);
    }
    return "user";
  };

  useEffect(() => {
    // Check for existing session on load
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session) {
        setIsAuthenticated(true);
        localStorage.setItem("token", session.access_token);
        await fetchUserProfile(session.user);
      } else {
        setIsAuthenticated(false);
        setUserRole(null);
      }
      setLoading(false);
    });

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session) {
          setIsAuthenticated(true);
          localStorage.setItem("token", session.access_token);
          const role = await fetchUserProfile(session.user);
          setUserRole(role);
        } else {
          setIsAuthenticated(false);
          setUserRole(null);
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
    setUserRole(null);
  };

  const ProtectedRoute = ({ element }) => {
    return isAuthenticated ? element : <Navigate to="/login" />;
  };

  const AdminRoute = ({ element }) => {
    const activeRole = userRole || localStorage.getItem("role");
    return isAuthenticated && activeRole === "admin" ? element : <Navigate to="/" />;
  };

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', fontSize: '18px' }}>Loading...</div>;

  return (
    <BrowserRouter>
      <Navbar isAuthenticated={isAuthenticated} userRole={userRole} onLogout={handleLogout} />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/explore" element={<Explore />} />
        <Route path="/form" element={<Form />} />
        <Route path="/login" element={<Login setIsAuthenticated={setIsAuthenticated} setUserRole={setUserRole} />} />
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
