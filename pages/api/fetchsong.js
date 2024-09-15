import { supabase } from '../../lib/supabaseClient';

const genres = {
    'easy' : [
        'electronic',
        'country',
        'classical',
        'reggae',
        'jazz',
        'hip-hop',
        'rock',
        'pop'
    ],

    'medium' : [
        'electronic',
        'country',
        'classical',
        'reggae',
        'jazz',
        'hip-hop',
        'rock',
        'pop'
    ],
}

function shuffleArray(array) {
    for (var i = array.length - 1; i > 0; i--) { 
   
        // Generate random number 
        var j = Math.floor(Math.random() * (i + 1));
                   
        var temp = array[i];
        array[i] = array[j];
        array[j] = temp;
    }
       
    return array;
 }

// Request new song from backend
export default async function handler(req, res) {
    if (req.method == "GET") {
        const data = req.query;
        // If we just started game, we need to update difficulty & curr solves in database
        if (data['first_song'] && data['difficulty']) {
            const { data: newUser, error: insertError } = await supabase
            .from('Users')
            .update({"current_difficulty": data['difficulty'], "current_solves": 0 })
            .eq('id', data['id']);

            if (insertError) {
                throw(insertError);
            }
        }

        // Get current user data
        const { data: user, error: fetchError } = await supabase
        .from('Users')
        .select('*')
        .eq('id', data['id'])
        .single();

        if (fetchError) {
            throw(fetchError);
        }

        let difficulty = user['current_difficulty'];

        // Get random song from database with provided difficulty
        const { data: songs, error: fetchSongError } = await supabase
        .from('Songs')
        .select('*')
        .eq('difficulty', difficulty)

        if (songs.length != 0) {
            const randomIndex = Math.floor(Math.random() * songs.length);

            const correct_song = songs[randomIndex];

            const { data: newUserSong, error: updateSongError } = await supabase
            .from('Users')
            .update({"current_correct": correct_song.genres})
            .eq('id', data['id']);

            // easy -> 4, med -> 6, hard -> 8
            const numGenreChoices = difficulty == 'easy' ? 4 : (difficulty == 'medium' ? 6 : 8);
            const correctGenres = correct_song.genres.split(';');
            console.log(correctGenres);
            let genreChoices = new Array();
            correctGenres.forEach(genre => {
                genreChoices.push(genre);
                console.log(genre);
            });
            for (let i = correctGenres.length; i < numGenreChoices; i++) {
                let randGenre = genres[difficulty][Math.floor(Math.random() * genres[difficulty].length)];
                while (genreChoices.includes(randGenre)) {
                    randGenre = genres[difficulty][Math.floor(Math.random() * genres[difficulty].length)];
                }
                genreChoices.push(randGenre);
            }
            // Randomize order to prevent deterministic answer
            genreChoices = shuffleArray(genreChoices);
            console.log(genreChoices);

            // Return choices
            res.status(200).json({ success: true, choices: genreChoices, audio: correct_song.url });
        } else {
            res.status(500).json({ success: false, message: 'No songs found' });
        }

        res.status(200).json(data);
    } else {
        res.status(405).json({ success: false, message: 'Method not allowed' });
    }
}