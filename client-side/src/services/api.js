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

  // Insert profile row
  if (data.user) {
    const { error: profileError } = await supabase.from('profiles').insert({
      id: data.user.id,
      fname,
      lname,
      phone,
      role: 'user',
      status: 'active'
    });
    if (profileError) console.error('Profile insert error:', profileError.message);
  }

  return data;
};

// ✅ Login
export const login = async ({ email, password }) => {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;

  // Check if user is denied
  const { data: profile } = await supabase
    .from('profiles')
    .select('status, role, profile_pic')
    .eq('id', data.user.id)
    .single();

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
