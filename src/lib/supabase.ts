import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://wiryyqxmcnkwupnmpsyc.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Indpcnl5cXhtY25rd3Vwbm1wc3ljIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI3NDE1NjQsImV4cCI6MjA2ODMxNzU2NH0.OtGJtaUkq2YRm5Ag2eneOelRLtqjysYDFK9lY7_rU7E'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)