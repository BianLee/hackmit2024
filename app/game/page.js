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
  const [userInput, setUserInput] = useState('');

  // Define common and obscure genres
  const commonGenres = ['pop', 'rock', 'hip hop', 'jazz', 'classical', 'country', 'electronic', 'reggae'];
  const obscureGenres = ['ambient', 'krautrock', 'synthwave', 'glitch hop', 'math rock', 'shoegaze', 'vaporwave'];

  useEffect(() => {
    const diff = searchParams.get('difficulty') || 'easy';
    setDifficulty(diff);
    console.log('GamePage mounted with difficulty:', diff);
    fetchSong(diff);
  }, [searchParams]);

  const fetchSong = async (diff) => {
    console.log('Fetching song for difficulty:', diff);
    try {
      let songQuery = supabase.from('Songs').select('*');

      // Fetch all songs from the database
      const { data: songsData, error } = await songQuery;

      if (error) {
        console.error('Error fetching songs from Supabase:', error);
        return;
      }

      if (!songsData || songsData.length === 0) {
        console.error('No songs found in the database');
        return;
      }

      // Filter songs based on difficulty
      let filteredSongs = [];

      if (diff === 'easy') {
        // Songs with common genres
        filteredSongs = songsData.filter((song, index) => {
          console.log(`Processing song at index ${index}:`, song);

          if (!song.genres) {
            console.warn(`Warning: Song at index ${index} has undefined genres. Skipping this song.`);
            return false; // Exclude this song from the filtered list
          }

          const genresArray = song.genres.split(';').map((g) => g.trim().toLowerCase());
          return genresArray.some((genre) => commonGenres.includes(genre));
        });
      } else if (diff === 'medium') {
        // Songs with no more than 2 genres
        filteredSongs = songsData.filter((song, index) => {
          console.log(`Processing song at index ${index}:`, song);

          if (!song.genres) {
            console.warn(`Warning: Song at index ${index} has undefined genres. Skipping this song.`);
            return false;
          }

          const genresArray = song.genres.split(';').map((g) => g.trim());
          return genresArray.length <= 2;
        });
      } else if (diff === 'hard' || diff === 'legend') {
        // Songs with obscure genres and 3+ genres
        filteredSongs = songsData.filter((song, index) => {
          console.log(`Processing song at index ${index}:`, song);

          if (!song.genres) {
            console.warn(`Warning: Song at index ${index} has undefined genres. Skipping this song.`);
            return false;
          }

          const genresArray = song.genres.split(';').map((g) => g.trim().toLowerCase());
          return genresArray.length >= 3 && genresArray.some((genre) => obscureGenres.includes(genre));
        });
      } else {
        // Default to 'easy' if difficulty is unrecognized
        filteredSongs = songsData.filter((song, index) => {
          console.log(`Processing song at index ${index}:`, song);

          if (!song.genres) {
            console.warn(`Warning: Song at index ${index} has undefined genres. Skipping this song.`);
            return false;
          }

          const genresArray = song.genres.split(';').map((g) => g.trim().toLowerCase());
          return genresArray.some((genre) => commonGenres.includes(genre));
        });
      }

      if (filteredSongs.length === 0) {
        console.error('No songs found for difficulty:', diff);
        return;
      }

      // Get a random song from the filtered list
      const randomIndex = Math.floor(Math.random() * filteredSongs.length);
      const songData = filteredSongs[randomIndex];

      console.log('Song data received:', songData);

      setCurrentSong(songData);

      if (diff !== 'legend') {
        // For multiple-choice difficulties, generate choices
        const choices = await generateChoices(songData.genres, diff);
        setChoices(choices);
      } else {
        // For 'music-legend', set the correct answer in the user's data
        if (isSignedIn) {
          await supabase
            .from('users')
            .update({
              current_correct: songData.genres,
              current_difficulty: diff,
              current_solves: score,
            })
            .eq('id', user.id);
        }
      }

    } catch (error) {
      console.error('Error fetching song:', error);
    }
  };

  const generateChoices = async (correctGenresString, diff) => {
    try {
      let genresList = [];

      // Determine genres to use based on difficulty
      if (diff === 'easy') {
        genresList = commonGenres;
      } else if (diff === 'medium') {
        // Fetch genres from songs with no more than 2 genres
        const { data: songsData, error } = await supabase
          .from('Songs')
          .select('genres');

        if (error) {
          console.error('Error fetching genres from Supabase:', error);
          return [];
        }

        // Get genres from songs with <= 2 genres
        const genresSet = new Set();
        songsData.forEach((song) => {
          if (!song.genres) return;
          const genresArray = song.genres.split(';').map((g) => g.trim());
          if (genresArray.length <= 2) {
            genresArray.forEach((genre) => genresSet.add(genre));
          }
        });
        genresList = Array.from(genresSet);
      } else if (diff === 'hard') {
        genresList = obscureGenres;
      }

      // Exclude the correct genres
      const correctGenres = correctGenresString.split(';').map((g) => g.trim());
      const filteredGenres = genresList.filter((genre) => !correctGenres.includes(genre));

      // Shuffle and pick random genres
      const shuffledGenres = filteredGenres.sort(() => 0.5 - Math.random());
      const wrongChoices = shuffledGenres.slice(0, 3); // Get 3 wrong choices

      // For multiple correct genres, pick one as the correct answer
      const correctGenre = correctGenres[Math.floor(Math.random() * correctGenres.length)];

      // Combine correct genre and wrong choices
      const allChoices = [correctGenre, ...wrongChoices];

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
    console.log('Correct genre(s):', currentSong.genres);

    const correctGenres = currentSong.genres.split(';').map((g) => g.trim().toLowerCase());
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

  const submitAnswer = async () => {
    if (!isSignedIn) {
      console.error('User is not signed in');
      return;
    }

    try {
      const response = await fetch('/api/submitsolve', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id: user.id, input: userInput }),
      });

      const result = await response.json();

      if (result.success && result.message === 'Correct') {
        console.log('Answer is correct');
        setScore(score + 1);
        await updateUserStats();
        setUserInput('');
        fetchSong(difficulty);
      } else {
        console.log('Answer is incorrect');
        router.push(`/game-over?score=${score}&difficulty=${difficulty}`);
      }
    } catch (error) {
      console.error('Error submitting answer:', error);
    }
  };

  const updateUserStats = async () => {
    /*const columnToUpdate = {
      easy: 'easy_solves',
      medium: 'medium_solves',
      hard: 'hard_solves',
      'legend': 'legend_solves',
    }[difficulty];*/

    //const highScoreColumn = {
      //easy: 'high_easy',
      //medium: 'high_medium',
      //hard: 'high_hard',
      //'legend': 'high_legend',
    //}[difficulty];

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
            <div className="mt-4">
              <input
                type="text"
                placeholder="Enter the genre"
                className="text-black p-2 rounded"
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
              />
              <Button onClick={submitAnswer} className="ml-2">
                Submit
              </Button>
            </div>
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
