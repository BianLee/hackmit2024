// app/api/user/route.js
import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs';
import { supabase } from '@/lib/supabaseClient';

export async function GET() {
  const { userId } = auth();
  console.log('--- API GET /api/user called ---');
  console.log('User ID:', userId);

  if (!userId) {
    console.log('Unauthorized access attempt to GET /api/user');
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data: user, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) {
    console.error('Error fetching user from Supabase:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (!user) {
    console.log('User not found in Supabase for user ID:', userId);
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  console.log('User data retrieved:', user);
  return NextResponse.json(user);
}

export async function POST(request) {
  const { userId } = auth();
  console.log('--- API POST /api/user called ---');
  console.log('User ID:', userId);

  if (!userId) {
    console.log('Unauthorized access attempt to POST /api/user');
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const data = await request.json();
  console.log('Data received in POST request:', data);

  const { data: user, error } = await supabase
    .from('users')
    .insert([
      {
        id: userId,
        name: data.username || 'Anonymous',
        easy_solves: 0,
        medium_solves: 0,
        hard_solves: 0,
        legend_solves: 0,
        high_easy: 0,
        high_medium: 0,
        high_hard: 0,
        high_legend: 0,
        high_increasing: 0,
        current_correct: '',
      },
    ])
    .select()
    .single();

  if (error) {
    console.error('Error inserting new user into Supabase:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  console.log('New user created in Supabase:', user);
  return NextResponse.json(user, { status: 201 });
}

export async function PUT(request) {
  const { userId } = auth();
  console.log('--- API PUT /api/user called ---');
  console.log('User ID:', userId);

  if (!userId) {
    console.log('Unauthorized access attempt to PUT /api/user');
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const data = await request.json();
  console.log('Data received in PUT request:', data);

  const { data: user, error } = await supabase
    .from('users')
    .update(data)
    .eq('id', userId)
    .select()
    .single();

  if (error) {
    console.error('Error updating user in Supabase:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  console.log('User updated in Supabase:', user);
  return NextResponse.json(user);
}
