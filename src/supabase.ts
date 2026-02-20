import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || 'https://afbcyivirvhcwdmdqyvz.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFmYmN5aXZpcnZoY3dkbWRxeXZ6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MTU1MTM3OCwiZXhwIjoyMDg3MTI3Mzc4fQ.yCZo1quJOEm1G3M4WzUrpHT4biOkATMYCJGta3c5XaA';

export const supabase = createClient(supabaseUrl, supabaseKey);
