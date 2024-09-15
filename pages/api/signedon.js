import { supabase } from '../../lib/supabaseClient';

// Check if user is in database already. If not, insert them.
export default async function handler(req, res) {
    if (req.method == "POST") {
        const {id, name} = req.body;

        console.log("Received " + id + " and " + name);

        const { data: existingUser, error: fetchError } = await supabase
        .from('Users')
        .select('*')
        .eq('id', id)
        .single();

        if (fetchError && fetchError.code !== 'PGRST116') {
            // If there's an error other than "row not found", throw it
            throw fetchError;
        }

        if (existingUser) {
            // If user exists, return success message with the existing user data
            res.status(200).json({ success: true, message: 'User already exists', user: existingUser });
        } else {
            // Step 2: Insert new user if no existing user was found
            const { data: newUser, error: insertError } = await supabase
                .from('Users')
                .insert([{id: id, name: name }])
                .single();

            if (insertError) {
                throw insertError;
            }

            // Return success message with the new user data
            res.status(201).json({ success: true, message: 'New user inserted', user: newUser });
        }
    } else {
        res.status(405).json({ success: false, message: 'Method not allowed' });
    }
}