import { supabase } from './supabaseClient';

// ✅ Get user profile (from profiles table)
export const getProfile = async () => {
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('profiles')
    .select('id, fname, lname, phone, profile_pic, blood_group, last_donated')
    .eq('id', user.id)
    .single();

  if (error) {
    // If the profile was not found (PGRST116), it might be due to the previous 'email' column bug.
    // Let's create it on the fly so the user can see their profile.
    if (error.code === 'PGRST116') {
      const newProfile = {
        id: user.id,
        fname: user.user_metadata?.fname || user.user_metadata?.full_name?.split(" ")[0] || "User",
        lname: user.user_metadata?.lname || user.user_metadata?.full_name?.split(" ").slice(1).join(" ") || "",
        phone: user.user_metadata?.phone || "Not Provided",
        profile_pic: user.user_metadata?.avatar_url || "",
        role: "user",
        status: "active"
      };
      await supabase.from('profiles').insert(newProfile);
      return {
        id: newProfile.id,
        fname: newProfile.fname,
        lname: newProfile.lname,
        email: user.email,
        phone: newProfile.phone,
        profilePic: newProfile.profile_pic,
        bloodGroup: null,
        lastDonated: 'Never'
      };
    }
    throw error;
  }

  return {
    id: data.id,
    fname: data.fname,
    lname: data.lname,
    email: user.email,
    phone: data.phone,
    profilePic: data.profile_pic,
    bloodGroup: data.blood_group,
    lastDonated: data.last_donated || 'Never'
  };
};

// ✅ Update user profile
export const updateProfile = async ({ fname, lname, phone, profilePic, bloodGroup, lastDonated }) => {
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) throw new Error('Not authenticated');

  const updates = {
    fname,
    lname,
    phone,
    blood_group: bloodGroup || null,
    last_donated: lastDonated || 'Never'
  };

  if (profilePic && profilePic.startsWith('data:image')) {
    updates.profile_pic = profilePic;
  }

  const { error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', user.id);

  if (error) throw error;
};
