import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Missing Supabase environment variables");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Employee = {
  id: string;
  first_name: string;
  second_name: string;
  third_name: string;
  full_name_id: string;
  phone: string;
  skills: string;
  profile_photo_url: string | null;
  id_front_url: string | null;
  id_back_url: string | null;
  created_at: string;
};
