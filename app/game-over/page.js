// app/game-over/page.js
"use client";

import React, { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import { Button } from '@/components/ui/button';

export default function GameOverPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isSignedIn } = useUser();

  const score = searchParams.get('score') || 0;
  const difficulty = searchParams.get('difficulty') || 'easy';

  useEffect(() => {
    console.log('GameOverPage mounted');
    console.log('User score:', score);
    console.log('Difficulty:', difficulty);
  }, [score, difficulty]);

  const handlePlayAgain = () => {
    console.log('Play Again button clicked');
    router.push(`/game?difficulty=${difficulty}&first=1`);
  };

  const handleLeaderboard = () => {
    console.log('View Leaderboard button clicked');
    router.push('/leaderboard');
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen rainbow-background text-white">
      <h1 className="text-4xl font-bold mb-8">Game Over</h1>
      <p className="text-2xl mb-4">You guessed {score} song(s) correctly!</p>
      <div className="space-y-4">
        <Button onClick={handlePlayAgain} className="w-full bg-green-500">
          Play Again
        </Button>
	  {   /*     <Button onClick={handleLeaderboard} className="w-full bg-blue-500">
          View Leaderboard
        </Button> */}
      </div>
      {isSignedIn && (
        <div className="absolute top-4 right-4">
          <Button onClick={() => router.push('/profile')} className="bg-gray-500">
            Profile
          </Button>
        </div>
      )}
    </div>
  );
}
