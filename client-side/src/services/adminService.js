import { supabase } from './supabaseClient';

// ✅ Get all users (admin only) - fetches from profiles table
export const getAllUsers = async () => {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, fname, lname, phone, profile_pic, role, status, created_at')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data || []).map(u => ({ ...u, email: u.email || '' }));
};

// ✅ Toggle user status (active / denied)
export const updateUserStatus = async (userId, status) => {
  const { error } = await supabase
    .from('profiles')
    .update({ status })
    .eq('id', userId);
  if (error) throw error;
};

// ✅ Get all hospitals
export const getHospitals = async () => {
  const { data, error } = await supabase
    .from('hospitals')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data || [];
};

// ✅ Add a hospital
export const addHospital = async ({ name, location, contact, available_beds, blood_inventory }) => {
  const { error } = await supabase.from('hospitals').insert({
    name, location, contact,
    available_beds: available_beds || 0,
    blood_inventory: blood_inventory || ''
  });
  if (error) throw error;
};

// ✅ Delete a hospital
export const deleteHospital = async (id) => {
  const { error } = await supabase.from('hospitals').delete().eq('id', id);
  if (error) throw error;
};

// ✅ Get all donation requests (receivers)
export const getRequests = async () => {
  const { data, error } = await supabase
    .from('receivers')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data || [];
};

// ✅ Get all donors for admin (approved, pending, rejected)
export const getAllDonors = async () => {
  const { data, error } = await supabase
    .from('donors')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data || [];
};

// ✅ Update donor approval status
export const updateDonorStatus = async (id, status) => {
  const { error } = await supabase
    .from('donors')
    .update({ status })
    .eq('id', id);
  if (error) throw error;
};

// ✅ Match donors and hospitals for a request
export const getMatches = async ({ blood_type, district, city }) => {
  const [{ data: donors }, { data: hospitals }] = await Promise.all([
    supabase
      .from('donors')
      .select('id, name, phone, email, city, district, availability, blood_type, gender')
      .eq('blood_type', blood_type)
      .eq('availability', true)
      .eq('status', 'approved'), // only match approved donors
    supabase
      .from('hospitals')
      .select('id, name, location, contact, available_beds, blood_inventory')
  ]);

  // Sort donors: prefer same city first, then same district
  const sorted = (donors || []).sort((a, b) => {
    const aCity = a.city?.toLowerCase() === city?.toLowerCase() ? 0 : 1;
    const bCity = b.city?.toLowerCase() === city?.toLowerCase() ? 0 : 1;
    return aCity - bCity;
  });

  return { donors: sorted, hospitals: hospitals || [] };
};
