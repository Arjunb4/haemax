import { supabase } from './supabaseClient';

// ✅ Register a donor
export const registerDonor = async (donorData) => {
  const { error } = await supabase.from('donors').insert({
    name: donorData.name,
    phone: donorData.phone,
    email: donorData.email,
    blood_type: donorData.blood_type,
    gender: donorData.gender,
    weight: donorData.weight,
    dob: donorData.dob,
    last_donated_date: donorData.lastDonatedDate || null,
    city: donorData.city,
    district: donorData.district,
    availability: true
  });
  if (error) throw error;
  return { success: true, message: 'Donor registered successfully!' };
};

// ✅ Search donors by blood type, district, city
export const searchDonors = async ({ blood_type, district, city }) => {
  const { data, error } = await supabase
    .from('donors')
    .select(`
      id, name, dob, phone, blood_type, city, district,
      availability, gender, weight, last_donated_date,
      profiles!donors_email_fkey(profile_pic)
    `)
    .eq('blood_type', blood_type.trim().toUpperCase())
    .ilike('district', district.trim())
    .ilike('city', city.trim());

  if (error) {
    // Fallback without join if FK doesn't exist yet
    const { data: fallback, error: fallbackErr } = await supabase
      .from('donors')
      .select('id, name, dob, phone, blood_type, city, district, availability, gender, weight, last_donated_date')
      .eq('blood_type', blood_type.trim().toUpperCase())
      .ilike('district', district.trim())
      .ilike('city', city.trim());
    if (fallbackErr) throw fallbackErr;
    return fallback || [];
  }

  // Normalize profile pic
  return (data || []).map(d => ({
    ...d,
    profilePic: d.profiles?.profile_pic || null,
    lastDonatedDate: d.last_donated_date
  }));
};

// ✅ Get my donations (by logged-in user email)
export const getMyDonations = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('donors')
    .select('id, name, blood_type, district, city, availability, last_donated_date')
    .eq('email', user.email)
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  if (error && error.code === 'PGRST116') return null; // No row found
  if (error) throw error;

  return { ...data, lastDonatedDate: data?.last_donated_date };
};

// ✅ Get stats for home/explore page
export const getDonorStats = async () => {
  const { data: donorRows } = await supabase
    .from('donors')
    .select('blood_type');

  const { count: totalDonors } = await supabase
    .from('donors')
    .select('*', { count: 'exact', head: true });

  const { count: totalReceivers } = await supabase
    .from('receivers')
    .select('*', { count: 'exact', head: true });

  const stats = { 'A+': 0, 'A-': 0, 'B+': 0, 'B-': 0, 'O+': 0, 'O-': 0, 'AB+': 0, 'AB-': 0 };
  (donorRows || []).forEach(row => {
    const bt = (row.blood_type || '').toUpperCase().trim();
    if (stats[bt] !== undefined) stats[bt]++;
  });

  return { bloodGroups: stats, totalDonors: totalDonors || 0, totalReceivers: totalReceivers || 0 };
};
