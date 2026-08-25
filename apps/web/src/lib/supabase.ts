import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://eyskoxjbzziahdatzvmq.supabase.co';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_YC_deZ2YNk0EwpdQBEliMQ_X2ES1f10';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
