// File: app/game/page.tsx
"use client"

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';

export default function GamePage() {
  const [score, setScore] = useState(0);

  // Placeholder for game logic
  const handleGuess = () => {
    // Implement your game logic here
    setScore(prevScore => prevScore + 1);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-blue-500 to-purple-600 text-white">
      <h1 className="text-4xl font-bold mb-8">Music Genre Guessing Game</h1>
      <p className="text-2xl mb-4">Score: {score}</p>
      <Button 
        onClick={handleGuess}
        className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded"
      >
        Make a Guess
      </Button>
    </div>
  );
}