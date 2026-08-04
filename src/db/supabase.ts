import { createClient } from "@supabase/supabase-js";

// Look for Supabase credentials across all common Vercel/Vite prefixes
const supabaseUrl = 
  import.meta.env.VITE_SUPABASE_URL || 
  import.meta.env.NEXT_PUBLIC_SUPABASE_URL || 
  import.meta.env.SUPABASE_URL || 
  '';

const supabaseAnonKey = 
  import.meta.env.VITE_SUPABASE_ANON_KEY || 
  import.meta.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 
  import.meta.env.SUPABASE_ANON_KEY || 
  '';

// Create the client ONLY if URL is available to prevent immediate crashes
// If not available, we use a fake object that throws helpful errors when called
export const supabase = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey)
  : new Proxy({} as any, {
      get: function(target, prop) {
        if (prop === 'auth') {
          return {
            getSession: () => Promise.resolve({ data: { session: null }, error: null }),
            onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } })
          };
        }
        return function() {
          console.error(`Supabase client is not configured. Missing Environment Variables.`);
          return Promise.reject(new Error("Database connection not configured. Please redeploy Vercel with VITE_SUPABASE_URL."));
        };
      }
    });
