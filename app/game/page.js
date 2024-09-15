"use client";

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import { Button } from '@/components/ui/button';

export default function GamePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isSignedIn, user } = useUser();

  const [choices, setChoices] = useState([]);
  const [audioUrl, setAudioUrl] = useState('');
  const [loading, setLoading] = useState(true);
  const [score, setScore] = useState(0);
  const [numChoices, setNumChoices] = useState(1);
  const [selectedChoices, setSelectedChoices] = useState([]); // For easy/med/hard
  const [userInput, setUserInput] = useState(''); // For legend
  const [diff, setDiff] = useState('easy');
  const [first, setFirst] = useState(1);

  const fetchSong = async () => {
    try {
      const res = await fetch(`/api/fetchsong?difficulty=${diff}&firstRequest=${first}&id=${user.id}`);
      const data = await res.json();

      // Update state with choices and audio URL
      setChoices(data.choices || []);
      console.log(data.choices);
      setAudioUrl(data.audio || '');
      console.log(audioUrl);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching song:', err);
      setLoading(false);
    }
  };

  useEffect(() => {
    const difficulty = searchParams.get('difficulty') || '';
    setDiff(difficulty);
    setNumChoices(diff === 'easy' ? 1 : 2);
    console.log(numChoices);
    setFirst(searchParams.get('first') == true ? 1 : 0);

    if (isSignedIn)
      fetchSong();

  }, [searchParams, isSignedIn]);

  // Handle button selection (toggle logic)
  const handleToggleChoice = (choice) => {
    if (selectedChoices.includes(choice)) {
      // If already selected, deselect
      setSelectedChoices(selectedChoices.filter((c) => c !== choice));
    } else if (selectedChoices.length < numChoices) {
      // If not selected and the number of selections is below the limit, select
      setSelectedChoices([...selectedChoices, choice]);
    }
  };

  // Handle submit
  const handleSubmit = async () => {
    if (selectedChoices.length === numChoices || diff === 'legend') {
      const genres = diff === 'legend' ? userInput : selectedChoices.join(';');
      genres.replaceAll(' ', ';');

      try {
        const response = await fetch('/api/submitsolve', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ id: user.id, input: genres }),
        });
  
        const result = await response.json();
  
        if (result.success && result.message === 'Correct') {
          console.log('Answer is correct');
          setScore(score + 1);
          setSelectedChoices([]);
          setUserInput('');
          setAudioUrl('');
          setChoices([]);
          //router.replace(`/game?difficulty=${diff}&first=0`);
          setLoading(true);
          fetchSong();
        } else {
          console.log('Answer is incorrect');
          router.push(`/game-over?score=${score}&difficulty=${diff}`);
        }
      } catch (error) {
        console.error('Error submitting answer:', error);
      }
    }
  };

  if (loading) return <p>Loading...</p>;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen rainbow-background text-white">
      <h1 className="text-2xl font-bold mb-4">Guess the Genre ({diff})</h1>
      {audioUrl && (
        <>
          <audio src={audioUrl} controls autoPlay />
          {diff === 'legend' ? (
            <div className="mt-4">
              <input
                type="text"
                placeholder="Enter the genre"
                className="text-black p-2 rounded"
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
              />
              <Button onClick={handleSubmit} className="ml-2">
                Submit
              </Button>
            </div>
          ) : (
            <div className="mt-4">
              {choices.map((choice) => (
                <Button
                  key={choice}
                  onClick={() => handleToggleChoice(choice)}
                  className={`m-2 ${selectedChoices.includes(choice) ? 'bg-blue-500' : ''}`} // Highlight selected
                  disabled={selectedChoices.length >= numChoices && !selectedChoices.includes(choice)} // Disable other buttons if max is reached
                >
                  {choice}
                </Button>
              ))}
              {selectedChoices.length === numChoices && (
                <div className="mt-4 flex justify-center">
                  <Button className="m-2" onClick={handleSubmit}>
                    Submit
                  </Button>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}