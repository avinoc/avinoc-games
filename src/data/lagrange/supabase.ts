import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://oajmdnlzvnliqxjifcfi.supabase.co';
const supabaseAnonKey = 'sb_publishable_8uapTjgcFAvmYEe4weCoeA_jM-_rtlN';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);