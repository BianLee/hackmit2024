import { supabase } from '../../lib/supabaseClient';

const easy_genres = [
    'Electronic',
    'Country',
    'Classical',
    'Reggae',
    'Jazz',
    'Hip-Hop',
    'Rock',
    'Pop'
];

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
        } else {
            res.status(500).json({ success: false, message: 'No songs found' });
        }

        res.status(200).json(data);
    } else {
        res.status(405).json({ success: false, message: 'Method not allowed' });
    }
}