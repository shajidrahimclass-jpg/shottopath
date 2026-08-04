import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '/workspace/app-9cyfgucqbpj5/.env' });

// We explicitly connect to tmjrqqdxujofixgajzcv to test
const supabaseUrl = 'https://tmjrqqdxujofixgajzcv.supabase.co';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY; 
// Wait, the anon key for tmjrqqdxujofixgajzcv might be different!
