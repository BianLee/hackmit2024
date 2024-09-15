// page.js
"use client";

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { SignInButton, SignOutButton, useUser } from '@clerk/nextjs';
import { Button } from '@/components/ui/button';

export default function GameLandingPage() {
  const router = useRouter();
  const { isSignedIn, user } = useUser();

  const handlePlay = () => {
    console.log('Play button clicked');
    router.push('/difficulty');
  };

  const handleSignOut = () => {
    console.log('Sign out button clicked');
    router.push('/'); // Redirect to the login page after sign-out
  };

  const handleSignedInUser = async () => {
    try {
      const response = await fetch('/api/signedon', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        // Proper object structure for JSON.stringify
        body: JSON.stringify({ id: user.id, name: user.firstName }),
      });

      const result = await response.json();

      if (result.success) {
        console.log('Success:', result.message, result.user);
      } else {
        console.error('Error:', result.error);
      }
    } catch (error) {
      console.error('Error while making the API request:', error);
    }
  };

  // Use useEffect to call the API when the user is signed in
  useEffect(() => {
    if (isSignedIn && user) {
      handleSignedInUser();
    }
  }, [isSignedIn]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen rainbow-background text-white">
      <h1 className="text-4xl font-bold mb-8">Music Genre Guessing Game</h1>
      <div className="space-y-4">
        {isSignedIn ? (
          <>
            <Button
              onClick={handlePlay}
              className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded"
            >
              Play
            </Button>
            <SignOutButton signOutCallback={handleSignOut}>
              <Button className="w-full bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded">
                Sign Out
              </Button>
            </SignOutButton>
          </>
        ) : (
          <>
            <Button
              onClick={handlePlay}
              className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded"
            >
              Play Anonymously
            </Button>
            <SignInButton mode="modal">
              <Button className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded">
                Sign In to Play
              </Button>
            </SignInButton>
          </>
        )}
        {isSignedIn && (
        <div className="absolute top-4 right-4">
          <Button onClick={() => router.push('/profile')} className="bg-gray-500">
            Profile
          </Button>
        </div>
      )}
      </div>
    </div>
  );
}
