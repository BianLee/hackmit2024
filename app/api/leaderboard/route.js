// app/api/leaderboard/route.js
import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

export async function GET() {
  console.log('--- API GET /api/leaderboard called ---');

  const { data: users, error } = await supabase
    .from('users')
    .select('name, high_easy')
    .order('high_easy', { ascending: false })
    .limit(10);

  if (error) {
    console.error('Error fetching leaderboard data from Supabase:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  console.log('Leaderboard data retrieved:', users);
  return NextResponse.json(users);
}
