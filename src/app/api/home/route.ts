import { NextResponse } from 'next/server';
import YTMusic from 'ytmusic-api';

const ytmusic = new YTMusic();

export async function GET() {
  try {
    await ytmusic.initialize();
    const results = await ytmusic.search('Global Top 50 Songs');
    
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
      }))
      .slice(0, 10); // return top 10 for home

    return NextResponse.json({ tracks });
  } catch (error) {
    console.error('Home error:', error);
    return NextResponse.json({ error: 'Failed to fetch home results' }, { status: 500 });
  }
}
