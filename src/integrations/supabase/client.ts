// This file is automatically generated. Do not edit it directly.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://jwcfphcyqcltevrahqlz.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp3Y2ZwaGN5cWNsdGV2cmFocWx6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU3NjI2MDEsImV4cCI6MjA2MTMzODYwMX0.fJmZzYDjuDZUpBHUILQXKtUzdpWVI9ajPX8aXwOWwCQ";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);