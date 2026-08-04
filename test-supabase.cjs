const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const url = 'https://ttkjtmybpkhecpfcxkip.supabase.co';
const key = 'sb_publishable_Y-RWhcBKpQTszi2j8e0D2w_BepCRjFk';

const supabase = createClient(url, key);

async function test() {
  console.log('Testing connection to Supabase...');
  
  // Test Database
  const { data, error } = await supabase.from('app_settings').select('*').limit(1);
  if (error) {
    console.error('Database Error:', error);
  } else {
    console.log('Database Connection: SUCCESS');
    console.log('Data:', data);
  }
  
  // Test Auth Sign-in with fake credentials
  const { error: authError } = await supabase.auth.signInWithPassword({
    email: 'fake@example.com',
    password: 'fakepassword123'
  });
  
  if (authError) {
    console.log('Auth Service: RESPONDING (Expected Invalid Login)');
    console.log('Auth message:', authError.message);
  } else {
    console.log('Auth Service: Something is wrong, fake login worked?');
  }
}

test();
