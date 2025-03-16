import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import HistoryPageClient from './client'

export default async function HistoryPage() {
  // CREATE SUPABASE CLIENT 🔌
  const supabase = await createClient()
  
  // VERIFY USER IS AUTHENTICATED 🔐
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  
  // REDIRECT TO LOGIN IF NOT AUTHENTICATED 🔒
  if (authError || !user) {
    redirect('/login?next=/history')
  }
  
  return <HistoryPageClient />
} 