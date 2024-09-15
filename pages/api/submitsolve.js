import { BorderAllIcon } from '@radix-ui/react-icons';
import { Users } from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';

// Submit solve data from user
export default async function handler(req, res) {
    if (req.method == "POST") {
        const {id, input} = req.body;

        console.log("Request: " + req.body)

        // By this time, current_answer in the database should be the actual expected answer.
        const { data: user, error: fetchError } = await supabase
        .from('Users')
        .select('*')
        .eq('id', id)
        .single();

        if (fetchError && fetchError.code !== 'PGRST116') {
            // If there's an error other than "row not found", throw it
            throw fetchError;
        }

        if (user.current_correct.split(';').sort().join(';') == input.split(';').sort().join(';')) {
            const newSolves = user.current_solves + 1;
            console.log(newSolves);
            let diffSolves = 0;
            if (user.current_difficulty.includes("easy")) {
                diffSolves = user.easy_solves + 1;
            } else if (user.current_difficulty.includes("medium")) {
                diffSolves = user.medium_solves + 1;
            } else if (user.current_difficulty.includes("hard")) {
                diffSolves = user.hard_solves + 1;
            } else if (user.current_difficulty.includes("legend")) {
                diffSolves = user.legend_solves + 1;
            } 
            console.log(diffSolves);
            
            let newDiff = user.current_difficulty;
            if (user.current_difficulty.includes("increasing")) {
                if (newSolves % 3 == 0) {
                    if (user.current_difficulty.includes("easy")) {
                        newDiff = "increasing;medium";
                    } else if (user.current_difficulty.includes("medium")) {
                        newDiff = "increasing;hard";
                    } else if (user.current_difficulty.includes("hard")) {
                        newDiff = "increasing;legend";
                    }
                }
            }
            const diffTable = user.current_difficulty + "_solves";
            console.log(diffTable);
            const { data: newUser, error: insertError } = await supabase
            .from('Users')
            .update({[diffTable]: diffSolves, "current_difficulty": newDiff, "current_solves": newSolves })
            .eq('id', id);

            if (insertError)
                throw(insertError);

            res.status(200).json({ success: true, message: 'Correct' });
        } else {
            let diffUpdate = "high";
            if (user.current_difficulty.includes("increasing")) {
                if (user.current_solves > user.high_increasing) {
                    diffUpdate += "_increasing";
                }
            } else if (user.current_difficulty.includes("legend")) {
                if (user.current_solves > user.high_legend) {
                    diffUpdate += "_legend";
                }
            } else if (user.current_difficulty.includes("hard")) {
                if (user.current_solves > user.high_hard) {
                    diffUpdate += "_hard";
                }
            } else if (user.current_difficulty.includes("medium")) {
                if (user.current_solves > user.high_medium) {
                    diffUpdate += "_medium";
                }
            }  else if (user.current_difficulty.includes("easy")) {
                if (user.current_solves > user.high_easy) {
                    diffUpdate += "_easy";
                }
            }

            console.log("Reset on fail.");

            const { data: newUser, error: insertError } = await supabase
            .from('Users')
            .update({"current_correct": "None", "current_difficulty": "easy", "current_solves": 0, [diffUpdate]: user.current_solves })
            .eq('id', id);

            res.status(200).json({success: true, message: 'Incorrect'});
        }
    } else {
        res.status(405).json({ success: false, message: 'Method not allowed' });
    }
}