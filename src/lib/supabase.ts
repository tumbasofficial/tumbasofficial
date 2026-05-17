import { createClient } from '@supabase/supabase-js';

// Kredensial Asli & Valid dari Proyek Supabase Kamu
const SUPABASE_URL_ASLI = 'https://yavdbmajcutebuhxvhjc.supabase.co';
const SUPABASE_ANON_KEY_ASLI = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlhdmRibWFqY3V0ZWJ1aHh2aGpjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg5NTYyODYsImV4cCI6MjA5NDUzMjI4Nn0.4TzWHFEL9-VQEC0XBjy0AISaikQjhZl27aE8hKaJOec';

// Membaca dari environment variable, jika kosong otomatis menggunakan cadangan asli di atas tanpa spasi
const supabaseUrl = (process.env.NEXT_PUBLIC_SUPABASE_URL || SUPABASE_URL_ASLI).trim();
const supabaseAnonKey = (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || SUPABASE_ANON_KEY_ASLI).trim();

export const supabase = createClient(supabaseUrl, supabaseAnonKey);