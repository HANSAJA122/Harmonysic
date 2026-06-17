import { NextResponse } from 'next/server';
import YTMusic from 'ytmusic-api';

const ytmusic = new YTMusic();

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q');

  if (!query) {
    return NextResponse.json({ error: 'Query parameter is required' }, { status: 400 });
  }

  try {
    await ytmusic.initialize();
    const results = await ytmusic.search(query);
    
    const tracks = results
      .filter((item: any) => item.type === 'SONG' && item.videoId)
      .map((item: any) => ({
        id: item.videoId,
        title: item.name,
        artist: item.artist?.name || 'Unknown Artist',
        album: item.album?.name || 'Single',
        albumUrl: item.thumbnails && item.thumbnails.length > 0 
          ? item.thumbnails[item.thumbnails.length - 1].url 
          : 'https://images.unsplash.com/photo-1614680376573-df3480f0c6ff?w=300&h=300&fit=crop',
        duration: item.duration || 180,
      }));

    return NextResponse.json({ tracks });
  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json({ error: 'Failed to fetch search results' }, { status: 500 });
  }
}
