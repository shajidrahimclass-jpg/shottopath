import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
  const { data: { session }, error: authError } = await supabase.auth.signInWithPassword({
    email: 'shajidrahimclass@gmail.com',
    password: 'password123'
  });

  console.log("Auth:", authError ? authError.message : "Success");

  const { data: appSettings, error: fetchError } = await supabase.from('app_settings').select('*').single();
  console.log("Fetch:", fetchError ? fetchError.message : appSettings);

  if (appSettings) {
    const { data, error } = await supabase
      .from('app_settings')
      .update({ site_title: appSettings.site_title + ' ' })
      .eq('id', appSettings.id)
      .select()
      .single();
    console.log("Update:", error ? error.message : data);
  }
}
test();
