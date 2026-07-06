import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const envContent = fs.readFileSync('.env.local', 'utf-8');
const lines = envContent.split('\n');
const env = {};
for (const line of lines) {
  const match = line.match(/^\s*([^#=\s]+)\s*=\s*(.*)\s*$/);
  if (match) {
    env[match[1]] = match[2].trim();
  }
}

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function check() {
  try {
    const { data: staff, error: staffError } = await supabase.from('staff').select('*');
    console.log("--- STAFF ---");
    if (staffError) console.error(staffError);
    else console.log(staff);

    const { data: timetable, error: ttError } = await supabase.from('timetable').select('*, staff(name)');
    console.log("--- TIMETABLE ---");
    if (ttError) console.error(ttError);
    else console.log(timetable);
  } catch (err) {
    console.error(err);
  }
}

check();
