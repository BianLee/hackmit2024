import React from 'react';
import { useRouter } from 'next/router';
// import { SignInButton } from '@clerk/nextjs';
import { Button } from '@/components/ui/button';

export default function GameLandingPage() {
  const router = useRouter();

  const handleAnonymousPlay = () => {
    router.push('/game');
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-blue-500 to-purple-600 text-white">
      <h1 className="text-4xl font-bold mb-8">Music Genre Guessing Game</h1>
      <div className="space-y-4">
        <Button 
          onClick={handleAnonymousPlay}
          className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded"
        >
          Play Anonymously
        </Button>
        {/* <SignInButton mode="modal"> */}
          <Button className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded">
            Sign In to Play
          </Button>
        {/* </SignInButton> */}
      </div>
    </div>
  );
}