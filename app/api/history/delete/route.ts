import { createClient } from '@/utils/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function DELETE(request: NextRequest) {
  try {
    // GET QUERY PARAMETERS 🔍
    const searchParams = request.nextUrl.searchParams
    const id = searchParams.get('id')
    
    if (!id) {
      return NextResponse.json(
        { error: 'Missing required parameter: id' },
        { status: 400 }
      )
    }
    
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
    
    // FIRST CHECK IF THE ITEM BELONGS TO THE USER 🔒
    const { data: item, error: fetchError } = await supabase
      .from('question_history')
      .select('user_id')
      .eq('id', id)
      .single()
    
    if (fetchError) {
      console.error('❌ ERROR FETCHING QUESTION HISTORY ITEM:', fetchError)
      return NextResponse.json(
        { error: 'Failed to fetch question history item' },
        { status: 500 }
      )
    }
    
    // VERIFY OWNERSHIP 🔐
    if (!item || item.user_id !== user.id) {
      return NextResponse.json(
        { error: 'Unauthorized: You do not have permission to delete this item' },
        { status: 403 }
      )
    }
    
    // DELETE THE ITEM 🗑️
    const { error: deleteError } = await supabase
      .from('question_history')
      .delete()
      .eq('id', id)
    
    if (deleteError) {
      console.error('❌ ERROR DELETING QUESTION HISTORY ITEM:', deleteError)
      return NextResponse.json(
        { error: 'Failed to delete question history item' },
        { status: 500 }
      )
    }
    
    // RETURN SUCCESS RESPONSE ✅
    return NextResponse.json({
      success: true,
      message: 'Question history item deleted successfully'
    })
    
  } catch (error) {
    console.error('❌ UNEXPECTED ERROR:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 