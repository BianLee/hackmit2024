// app/leaderboard/page.js
"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabaseClient';

export default function LeaderboardPage() {
  const router = useRouter();
  const { isSignedIn, user } = useUser();
  const [leaderboardData, setLeaderboardData] = useState([]);

  useEffect(() => {
    console.log('LeaderboardPage mounted');
    const fetchLeaderboard = async () => {
      console.log('Fetching leaderboard data from Supabase');
      const { data: users, error } = await supabase
        .from('Users')
        .select('name, high_easy')
        .order('high_easy', { ascending: false })
        .limit(10);

      if (error) {
        console.error('Error fetching leaderboard data:', error);
        return;
      }

      console.log('Leaderboard data fetched:', users);
      setLeaderboardData(users);
    };

    fetchLeaderboard();
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen rainbow-background text-white">
      <h1 className="text-4xl font-bold mb-8">Leaderboard</h1>
      <div className="w-full max-w-md">
        <table className="w-full text-left">
          <thead>
            <tr>
              <th className="py-2">Rank</th>
              <th className="py-2">Player</th>
              <th className="py-2">Score</th>
            </tr>
          </thead>
          <tbody>
            {leaderboardData.map((entry, index) => (
              <tr
                key={index}
                className={
                  isSignedIn && user.username === entry.name ? 'bg-yellow-500' : ''
                }
              >
                <td className="py-2">{index + 1}</td>
                <td className="py-2">{entry.name}</td>
                <td className="py-2">{entry.high_easy}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Button onClick={() => router.push('/')} className="mt-8 bg-blue-500">
        Back to Home
      </Button>
    </div>
  );
}
