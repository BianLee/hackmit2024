// app/game/page.js
"use client";

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabaseClient';

export default function GamePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isSignedIn, user } = useUser();

  const [currentSong, setCurrentSong] = useState(null);
  const [choices, setChoices] = useState([]);
  const [difficulty, setDifficulty] = useState('easy');
  const [score, setScore] = useState(0);

  useEffect(() => {
    const diff = searchParams.get('difficulty') || 'easy';
    setDifficulty(diff);
    console.log('GamePage mounted with difficulty:', diff);
    fetchSong(diff);
  }, [searchParams]);

  const fetchSong = async (diff) => {
    console.log('Fetching song for difficulty:', diff);
    try {
      // Fetch songs of the selected difficulty
      const { data: songs, error } = await supabase
        .from('Songs')
        .select('*')
        .eq('difficulty', diff);

      if (error) {
        console.error('Error fetching songs from Supabase:', error);
        return;
      }

      if (!songs || songs.length === 0) {
        console.error('No songs found for difficulty:', diff);
        return;
      }

      // Get a random song from the list
      const randomIndex = Math.floor(Math.random() * songs.length);
      const songData = songs[randomIndex];

      console.log('Song data received:', songData);

      setCurrentSong(songData);

      if (diff !== 'legend') {
        // For multiple-choice difficulties, generate choices
        const choices = await generateChoices(songData.genres.lower(), diff);
        setChoices(choices);
      }

    } catch (error) {
      console.error('Error fetching song:', error);
    }
  };

  const generateChoices = async (correctGenre, diff) => {
    try {
      // Fetch distinct genres from songs of the same difficulty
      const { data: genresData, error } = await supabase
        .from('Songs')
        .select('genre')
        .eq('difficulty', diff)
        .neq('genre', correctGenre); // Exclude the correct genre

      if (error) {
        console.error('Error fetching genres from Supabase:', error);
        return [];
      }

      // Extract genres and remove duplicates
      const genres = genresData.map((item) => item.genre);
      const uniqueGenres = [...new Set(genres)];

      // Shuffle and pick random genres
      const shuffledGenres = uniqueGenres.sort(() => 0.5 - Math.random());
      const wrongChoices = shuffledGenres.slice(0, 3); // Get 3 wrong choices

      // Combine correct genre and wrong choices
      const allChoices = [correctGenre.lower(), ...wrongChoices];

      // Shuffle all choices
      const shuffledChoices = allChoices.sort(() => 0.5 - Math.random());

      return shuffledChoices;
    } catch (error) {
      console.error('Error generating choices:', error);
      return [];
    }
  };

  const handleGuess = async (userGuess) => {
    console.log('User guessed:', userGuess);
    console.log('Correct genre(s):', currentSong.genre);

    const correctGenres = currentSong.genre.split(',').map((g) => g.trim().toLowerCase());
    const userGuessLower = userGuess.trim().toLowerCase();

    if (correctGenres.includes(userGuessLower)) {
      console.log('Guess is correct');
      setScore(score + 1);
      // Update user stats if signed in
      if (isSignedIn) {
        console.log('Updating user stats in Supabase');
        await updateUserStats();
      }
      fetchSong(difficulty);
    } else {
      console.log('Guess is incorrect');
      // Game over logic
      router.push(`/game-over?score=${score}&difficulty=${difficulty}`);
    }
  };

  const updateUserStats = async () => {
    const columnToUpdate = {
      easy: 'easy_solves',
      medium: 'medium_solves',
      hard: 'hard_solves',
      'legend': 'legend_solves',
    }[difficulty];

    const highScoreColumn = {
      easy: 'high_easy',
      medium: 'high_medium',
      hard: 'high_hard',
      'legend': 'high_legend',
    }[difficulty];

    // Fetch current user data
    const { data: userData, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single();

    if (error) {
      console.error('Error fetching user data:', error);
      return;
    }

    const updates = {};
    updates[columnToUpdate] = (userData[columnToUpdate] || 0) + 1;

    if (score + 1 > (userData[highScoreColumn] || 0)) {
      updates[highScoreColumn] = score + 1;
    }

    const { error: updateError } = await supabase
      .from('users')
      .update(updates)
      .eq('id', user.id);

    if (updateError) {
      console.error('Error updating user stats:', updateError);
    } else {
      console.log('User stats updated:', updates);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen rainbow-background text-white">
      <h1 className="text-2xl font-bold mb-4">Guess the Genre ({difficulty})</h1>
      {currentSong && (
        <>
          <audio src={currentSong.url} controls autoPlay />
          {difficulty === 'legend' ? (
            <input
              type="text"
              placeholder="Enter the genre"
              className="text-black p-2 rounded mt-4"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleGuess(e.target.value);
                  e.target.value = '';
                }
              }}
            />
          ) : (
            <div className="mt-4">
              {choices.map((genre) => (
                <Button key={genre} onClick={() => handleGuess(genre)} className="m-2">
                  {genre}
                </Button>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
