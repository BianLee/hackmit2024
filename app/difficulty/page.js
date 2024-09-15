// app/difficulty/page.js
"use client";

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';

export default function DifficultySelectionPage() {
  const router = useRouter();

  useEffect(() => {
    console.log('DifficultySelectionPage mounted');
  }, []);

  const handleDifficultySelect = (difficulty) => {
    console.log('Difficulty selected:', difficulty);
    router.push(`/game?difficulty=${difficulty}`);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen rainbow-background text-white">
      <h1 className="text-4xl font-bold mb-8">Select Difficulty</h1>
      <div className="space-y-4">
        <Button onClick={() => handleDifficultySelect('easy')} className="w-full bg-green-500">
          Easy
        </Button>
	  <Button onClick={() => handleDifficultySelect('medium')} className="w-full bg-yellow-500">
          Medium
        </Button>
        <Button onClick={() => handleDifficultySelect('hard')} className="w-full bg-orange-500">
          Hard
        </Button>
        <Button onClick={() => handleDifficultySelect('legend')} className="w-full bg-red-500">
          Music Legend
        </Button>
      </div>
    </div>
  );
}
