import { NextResponse } from 'next/server';

const SUNO_API_URL = 'https://studio-api.suno.ai/api/external/generate';

export async function GET(request) {
  console.log('API route /api/generate was called');

  try {
    const sunoRequestBody = {
      tags: "afrobeat",
      topic: "",
    };

    console.log('Request to Suno API:', sunoRequestBody);

    const sunoResponse = await fetch(SUNO_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.SUNO_API_KEY}`
      },
      body: JSON.stringify(sunoRequestBody)
    });

    console.log('Suno API Response Status:', sunoResponse.status);

    if (!sunoResponse.ok) {
      const errorText = await sunoResponse.text();
      console.error('Suno API Error Response:', errorText);
      throw new Error(`Suno API responded with status: ${sunoResponse.status}. Error: ${errorText}`);
    }

    const sunoData = await sunoResponse.json();
    console.log('Suno API Response:', sunoData);

    if (sunoData.id) {
      const audioUrl = `https://cdn1.suno.ai/${sunoData.id}.mp3`;
      console.log('Generated Audio URL:', audioUrl);
      return NextResponse.json({ id: sunoData.id, audioUrl });
    } else {
      throw new Error('No ID found in Suno API response');
    }
  } catch (error) {
    console.error('Error calling Suno API:', error);
    return NextResponse.json({ error: error.message || 'Failed to generate audio' }, { status: 500 });
  }
}