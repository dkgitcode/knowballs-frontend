import { createClient } from '@/utils/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    // GET QUERY PARAMETERS 🔍
    const searchParams = request.nextUrl.searchParams
    const limit = parseInt(searchParams.get('limit') || '10')
    const page = parseInt(searchParams.get('page') || '1')
    const query = searchParams.get('query') || ''
    const offset = (page - 1) * limit
    
    // CREATE SUPABASE CLIENT 🔌
    const supabase = await createClient()
    
    // VERIFY USER IS AUTHENTICATED 🔐
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
    
    // BUILD QUERY WITH FILTERS 🔍
    let supabaseQuery = supabase
      .from('question_history')
      .select('*', { count: 'exact' })
      .eq('user_id', user.id)
      
    // ADD SEARCH FILTER IF QUERY PROVIDED 🔎
    if (query) {
      // Use ilike for case-insensitive search with wildcards
      supabaseQuery = supabaseQuery.ilike('prompt', `%${query}%`)
    }
    
    // COMPLETE QUERY WITH SORTING AND PAGINATION 📄
    const { data, error, count } = await supabaseQuery
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)
    
    if (error) {
      console.error('❌ ERROR FETCHING QUESTION HISTORY:', error)
      return NextResponse.json(
        { error: 'Failed to fetch question history' },
        { status: 500 }
      )
    }
    
    // RETURN SUCCESS RESPONSE WITH PAGINATION INFO ✅
    return NextResponse.json({
      success: true,
      data,
      pagination: {
        total: count,
        page,
        limit,
        pages: Math.ceil((count || 0) / limit)
      }
    })
    
  } catch (error) {
    console.error('❌ UNEXPECTED ERROR:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 