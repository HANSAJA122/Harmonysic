import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';
import YTMusic from 'ytmusic-api';

const ytmusic = new YTMusic();

export async function POST(request: Request) {
  try {
    const { prompt } = await request.json();

    if (!prompt) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
    }

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json({ error: 'Gemini API key is not configured' }, { status: 500 });
    }

    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

    // 1. Call Gemini to generate a playlist
    const systemInstruction = "You are a professional music curator. The user will give you a prompt. You must generate a playlist of 10-15 songs that perfectly matches the prompt. Your response must be ONLY a valid JSON array of objects. Each object must have exactly two string properties: 'title' and 'artist'. Do not include markdown formatting or backticks. Only output raw JSON.";
    
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
            systemInstruction: systemInstruction,
            responseMimeType: "application/json",
            temperature: 0.7,
        }
    });

    const aiOutput = response.text || "[]";
    let songList = [];
    try {
        songList = JSON.parse(aiOutput);
    } catch (e) {
        console.error("Failed to parse Gemini output:", aiOutput);
        return NextResponse.json({ error: 'Failed to parse AI output' }, { status: 500 });
    }

    if (!Array.isArray(songList) || songList.length === 0) {
        return NextResponse.json({ error: 'AI generated an empty playlist' }, { status: 500 });
    }

    // 2. Query YouTube Music for the generated songs
    await ytmusic.initialize();
    
    const playableTracks = [];

    // Process sequentially to not hit rate limits, or Promise.all for speed. Let's do sequentially.
    for (const song of songList) {
        const searchQuery = `${song.title} ${song.artist}`;
        try {
            const results = await ytmusic.search(searchQuery);
            const topResult = results.find(r => r.type === 'SONG' || r.type === 'VIDEO');
            
            if (topResult) {
                playableTracks.push({
                    id: (topResult as any).videoId,
                    title: (topResult as any).name,
                    artist: (topResult as any).artist?.name || song.artist,
                    album: (topResult as any).album?.name || 'Unknown Album',
                    albumUrl: (topResult as any).thumbnails && (topResult as any).thumbnails.length > 0 
                        ? ((topResult as any).thumbnails.length > 1 ? (topResult as any).thumbnails[1].url : (topResult as any).thumbnails[0].url)
                        : 'https://images.unsplash.com/photo-1614680376573-df3480f0c6ff?w=300&h=300&fit=crop',
                    duration: (topResult as any).duration || 180,
                });
            }
        } catch (err) {
            console.warn(`Failed to find ${searchQuery}`, err);
        }
    }

    return NextResponse.json({ 
      playlistName: `Generated: ${prompt.substring(0, 30)}...`,
      tracks: playableTracks 
    });

  } catch (error: any) {
    console.error('AI Playlist generation error:', error);
    return NextResponse.json({ error: error.message || 'Failed to generate playlist' }, { status: 500 });
  }
}
