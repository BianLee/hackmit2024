// app/profile/page.js
"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser, SignOutButton } from '@clerk/nextjs';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabaseClient';

export default function ProfilePage() {
  const router = useRouter();
  const { isSignedIn, user } = useUser();
  const [userData, setUserData] = useState(null);

  if (!isSignedIn) {
    router.push('/');
    return null;
  }

  useEffect(() => {
    console.log('ProfilePage mounted');
    const fetchUserData = async () => {
      console.log('Fetching user data from Supabase for user ID:', user.id);
      const { data: existingUser, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // User doesn't exist, create a new one
          console.log('User not found in Supabase, creating new user');
          const { data: newUser, error: insertError } = await supabase
            .from('users')
            .insert({
              id: user.id,
              name: user.username || user.firstName || 'Anonymous',
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
            })
            .select()
            .single();

          if (insertError) {
            console.error('Error creating new user in Supabase:', insertError);
            return;
          }
          console.log('New user created:', newUser);
          setUserData(newUser);
        } else {
          console.error('Error fetching user data from Supabase:', error);
          return;
        }
      } else {
        console.log('User data fetched:', existingUser);
        setUserData(existingUser);
      }
    };

    fetchUserData();
  }, [user]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen rainbow-background text-white">
      <h1 className="text-4xl font-bold mb-8">Profile</h1>
      <p className="text-2xl mb-4">Username: {user.username || 'Anonymous'}</p>
      <p className="text-2xl mb-4">Email: {user.emailAddresses[0].emailAddress}</p>
      {userData ? (
        <>
          <p className="text-xl mb-2">Easy Solves: {userData.easy_solves}</p>
          <p className="text-xl mb-2">Medium Solves: {userData.medium_solves}</p>
          <p className="text-xl mb-2">Hard Solves: {userData.hard_solves}</p>
          <p className="text-xl mb-2">Music Legend Solves: {userData.legend_solves}</p>
          <p className="text-xl mb-2">High Easy Score: {userData.high_easy}</p>
          <p className="text-xl mb-2">High Medium Score: {userData.high_medium}</p>
          <p className="text-xl mb-2">High Hard Score: {userData.high_hard}</p>
          <p className="text-xl mb-2">High Music Legend Score: {userData.high_legend}</p>
          <p className="text-xl mb-2">Endless High Score: {userData.high_increasing}</p>
        </>
      ) : (
        <p>Loading user data...</p>
      )}
      <Button onClick={() => router.push('/')} className="mt-4 bg-blue-500">
        Back to Home
      </Button>
      <SignOutButton>
        <Button className="mt-4 bg-red-500">Sign Out</Button>
      </SignOutButton>
    </div>
  );
}
