import { NextResponse } from 'next/server';
import YTMusic from 'ytmusic-api';

const ytmusic = new YTMusic();

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const videoId = searchParams.get('videoId');

  if (!videoId) {
    return NextResponse.json({ error: 'Video ID is required' }, { status: 400 });
  }

  try {
    await ytmusic.initialize();
    
    const upNext = await ytmusic.getUpNexts(videoId);
    
    const tracks = upNext.map((item: any) => ({
      id: item.videoId,
      title: item.title || item.name,
      artist: item.artists || 'Unknown Artist',
      albumUrl: item.thumbnail || 'https://images.unsplash.com/photo-1614680376573-df3480f0c6ff?w=300&h=300&fit=crop',
      duration: item.duration ? parseInt(item.duration.split(':')[0]) * 60 + parseInt(item.duration.split(':')[1]) : 180,
    }));

    return NextResponse.json({ tracks });
  } catch (error) {
    console.error('Radio fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch radio tracks' }, { status: 500 });
  }
}
