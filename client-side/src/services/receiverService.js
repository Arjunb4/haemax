import { supabase } from './supabaseClient';

// ✅ Store a receiver request
export const storeReceiver = async ({ name, phone, blood_type, district, city }) => {
  const { error } = await supabase.from('receivers').insert({
    name: name.trim(),
    phone: phone.trim(),
    blood_type: blood_type.trim().toUpperCase(),
    district: district.trim(),
    city: city.trim()
  });
  if (error) throw error;
};

// ✅ Get all receivers
export const getReceivers = async () => {
  const { data, error } = await supabase
    .from('receivers')
    .select('id, name, phone, blood_type, district, city, created_at')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data || [];
};
