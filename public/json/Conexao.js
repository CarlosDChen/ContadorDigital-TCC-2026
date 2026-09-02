import { createClient } from '@supabase/supabase-js'

// Substitua pelas suas credenciais reais do painel do Supabase
const supabaseUrl = 'https://seu-projeto.supabase.co'
const supabaseKey = 'sua-anon-key'

export const supabase = createClient(supabaseUrl, supabaseKey)
