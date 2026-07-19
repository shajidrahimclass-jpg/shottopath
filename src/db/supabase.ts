
            import { createClient } from "@supabase/supabase-js";

            // Details are obfuscated to prevent plain-text scraping
            const decode = (str: string) => typeof window !== 'undefined' ? window.atob(str) : Buffer.from(str, 'base64').toString();
            
            const fallbackUrl = decode("aHR0cHM6Ly9kY2ZlZ3BseXNwY2llaHV2ZmdicC5zdXBhYmFzZS5jbw==");
            const fallbackKey = decode("ZXlKaGJHY2lPaUpJVXpJMU5pSXNJblI1Y0NJNklrcFhWQ0o5LmV5SnBjM01pT2lKemRYQmhZbUZ6WlNJc0luSmxaaUk2SW1SallXWmxkMmx3Ym5sM2FYSmhjbmt0YzNSaGFXOXVjbTFvZENJc0luSnZiR1VpT2lKaGMyOXVJaXdpYldGMFpTSTZNVGMzTURBME56RTFOU3dpWlhoaElqb3lNRGcxTmpJek1UVTBmUS5Qam94cnozcTJ2RXoyR0pydS05SWxOalhtQVlfN1ktQjZ1SGhDZEhZZTdV");

            const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || fallbackUrl;
            const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || fallbackKey;

            export const supabase = createClient(supabaseUrl, supabaseAnonKey);
            