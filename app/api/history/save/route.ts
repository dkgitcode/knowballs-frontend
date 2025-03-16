import { createClient } from '@/utils/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    // PARSE THE REQUEST BODY 📦
    const body = await request.json()
    const { prompt, answer, mode } = body
    
    if (!prompt || !answer) {
      return NextResponse.json(
        { error: 'Missing required fields' },
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
    
    // SAVE TO SUPABASE DATABASE 💾
    const { data, error } = await supabase
      .from('question_history')
      .insert([
        {
          user_id: user.id,
          prompt: prompt,
          answer: answer,
          mode: mode || 'answer', // Default to 'answer' if mode not provided
          created_at: new Date().toISOString()
        }
      ])
      .select()
    
    if (error) {
      console.error('❌ ERROR SAVING TO DATABASE:', error)
      return NextResponse.json(
        { error: 'Failed to save question history' },
        { status: 500 }
      )
    }
    
    // RETURN SUCCESS RESPONSE ✅
    return NextResponse.json({ 
      success: true, 
      message: 'Question history saved successfully',
      data 
    })
    
  } catch (error) {
    console.error('❌ UNEXPECTED ERROR:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 