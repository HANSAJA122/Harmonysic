import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const artist = searchParams.get('artist');
  const title = searchParams.get('title');

  if (!artist || !title) {
    return NextResponse.json({ error: 'Artist and title are required' }, { status: 400 });
  }

  try {
    // We use api.lyrics.ovh as a free, open API for lyrics
    const res = await fetch(`https://api.lyrics.ovh/v1/${encodeURIComponent(artist)}/${encodeURIComponent(title)}`);
    
    if (!res.ok) {
      if (res.status === 404) {
        return NextResponse.json({ lyrics: "We couldn't find lyrics for this song." });
      }
      throw new Error(`Lyrics API responded with status: ${res.status}`);
    }

    const data = await res.json();
    return NextResponse.json({ lyrics: data.lyrics });
  } catch (error) {
    console.error('Lyrics error:', error);
    return NextResponse.json({ lyrics: "We couldn't load the lyrics right now." });
  }
}
