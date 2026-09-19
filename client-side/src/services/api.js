import { supabase } from './supabaseClient';

// ✅ Signup
export const signup = async ({ fname, lname, phone, email, password }) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { fname, lname, phone }
    }
  });

  if (error) throw error;
  // Note: We DO NOT insert into `profiles` here.
  // This avoids RLS blocks because the user's email isn't verified yet.
  // Profile creation happens dynamically upon first login.
  return data;
};

// ✅ Login
export const login = async ({ email, password }) => {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;

  // Gracefully check if profile exists
  let { data: profile } = await supabase
    .from('profiles')
    .select('status, role, profile_pic')
    .eq('id', data.user.id)
    .maybeSingle();

  // If profile doesn't exist, this is their first login after confirming email! Create it.
  if (!profile) {
    const meta = data.user.user_metadata || {};
    const newProfile = {
      id: data.user.id,
      fname: meta.fname || meta.given_name || meta.full_name?.split(" ")[0] || "User",
      lname: meta.lname || meta.family_name || meta.full_name?.split(" ").slice(1).join(" ") || "",
      phone: meta.phone || "Not Provided",
      profile_pic: meta.avatar_url || "",
      role: 'user',
      status: 'active'
    };
    
    await supabase.from('profiles').insert(newProfile);
    profile = newProfile;
  }

  // Check if user is denied
  if (profile?.status === 'denied') {
    await supabase.auth.signOut();
    throw new Error('Your account has been deactivated. Please contact support.');
  }

  // Store in localStorage for convenience
  localStorage.setItem('token', data.session.access_token);
  localStorage.setItem('role', profile?.role || 'user');
  localStorage.setItem('profilePic', profile?.profile_pic || '');

  return {
    token: data.session.access_token,
    role: profile?.role || 'user',
    profilePic: profile?.profile_pic || ''
  };
};

// ✅ Google Login — opens Supabase OAuth redirect
export const googleLogin = async () => {
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: window.location.origin
    }
  });
  if (error) throw error;
};

// ✅ Logout
export const logout = async () => {
  await supabase.auth.signOut();
  localStorage.removeItem('token');
  localStorage.removeItem('role');
  localStorage.removeItem('profilePic');
};

// ✅ Get current session
export const getSession = async () => {
  const { data } = await supabase.auth.getSession();
  return data.session;
};
