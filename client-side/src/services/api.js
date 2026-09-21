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

  // Create initial profile record if user object is returned
  if (data?.user) {
    const isSpecialAdmin = email.toLowerCase().trim() === 'arjunbb441@gmail.com';
    const profileData = {
      id: data.user.id,
      email: data.user.email || email,
      fname,
      lname,
      phone: phone || "Not Provided",
      profile_pic: "",
      role: isSpecialAdmin ? 'admin' : 'user',
      status: 'active'
    };
    
    const { error: upsertError } = await supabase.from('profiles').upsert(profileData, { onConflict: 'id' });
    
    // Fallback if the 'email' column does not exist in the database (Code: 42703)
    if (upsertError && upsertError.code === '42703') {
       delete profileData.email;
       await supabase.from('profiles').upsert(profileData, { onConflict: 'id' });
    }
  }

  return data;
};

// ✅ Login
export const login = async ({ email, password }) => {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;

  // Gracefully check if profile exists (omitting 'email' to prevent crash if column is missing)
  let { data: profile } = await supabase
    .from('profiles')
    .select('status, role, profile_pic')
    .eq('id', data.user.id)
    .maybeSingle();

  const isSpecialAdmin = email.toLowerCase().trim() === 'arjunbb441@gmail.com';

  // If profile doesn't exist, create it
  if (!profile) {
    const meta = data.user.user_metadata || {};
    const newProfile = {
      id: data.user.id,
      email: data.user.email || email,
      fname: meta.fname || meta.given_name || meta.full_name?.split(" ")[0] || "User",
      lname: meta.lname || meta.family_name || meta.full_name?.split(" ").slice(1).join(" ") || "",
      phone: meta.phone || "Not Provided",
      profile_pic: meta.avatar_url || "",
      role: isSpecialAdmin ? 'admin' : 'user',
      status: 'active'
    };
    
    const { error: insertError } = await supabase.from('profiles').insert(newProfile);
    if (insertError && insertError.code === '42703') {
       delete newProfile.email;
       await supabase.from('profiles').insert(newProfile);
    }
    
    profile = newProfile;
  } else if (isSpecialAdmin && profile.role !== 'admin') {
    // Auto-promote arjunbb441@gmail.com to admin if not set
    await supabase.from('profiles').update({ role: 'admin' }).eq('id', data.user.id);
    profile.role = 'admin';
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
