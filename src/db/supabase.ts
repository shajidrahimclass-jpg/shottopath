
            import { createClient } from "@supabase/supabase-js";

            // Details are obfuscated to prevent plain-text scraping
            const decode = (str: string) => typeof window !== 'undefined' ? window.atob(str) : Buffer.from(str, 'base64').toString();
            
            const fallbackUrl = decode("aHR0cHM6Ly90dGtqdG15YnBraGVjcGZjeGtpcC5zdXBhYmFzZS5jbw==");
            const fallbackKey = decode("ZXlKaGJHY2lPaUpJVXpJMU5pSXNJblI1Y0NJNklrcFhWQ0o5LmV5SnBjM01pT2lKemRYQmhZbUZ6WlNJc0luSmxaaUk2SW5SMGEycDBiWGxpY0d0b1pXTndabU40YTJsd0lpd2ljbTlzWlNJNkltRnViMjRpTENKcFlYUWlPakUzTnpreU56a3dPRGdzSW1WNGNDSTZNakE1TkRnMU5UQTRPSDAuT1VmckZ4NkVHbmlOenA3TUEzZmVvcFZkUzVZYXdMejU0OHktTFRFTFlTWQ==");

            const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || fallbackUrl;
            const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || fallbackKey;

            export const supabase = createClient(supabaseUrl, supabaseAnonKey);
            