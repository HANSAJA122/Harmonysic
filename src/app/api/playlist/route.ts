import { NextResponse } from 'next/server';
import YTMusic from 'ytmusic-api';

const ytmusic = new YTMusic();

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json({ error: 'Playlist ID is required' }, { status: 400 });
  }

  try {
    await ytmusic.initialize();
    
    // Fetch playlist metadata
    const playlistData = await ytmusic.getPlaylist(id);
    
    // Fetch playlist tracks
    const videos = await ytmusic.getPlaylistVideos(id);
    
    const tracks = videos
      .filter((item: any) => item.videoId)
      .map((item: any) => ({
        id: item.videoId,
        title: item.name,
        artist: item.artist?.name || 'Unknown Artist',
        album: item.album?.name || 'Unknown Album',
        albumUrl: item.thumbnails && item.thumbnails.length > 0 
          ? (item.thumbnails.length > 1 ? item.thumbnails[1].url : item.thumbnails[0].url)
          : 'https://images.unsplash.com/photo-1614680376573-df3480f0c6ff?w=300&h=300&fit=crop',
        duration: item.duration || 180,
      }));

    return NextResponse.json({ 
      playlist: {
        id: playlistData.playlistId,
        title: playlistData.name,
        description: 'Playlist',
        imageUrl: playlistData.thumbnails && playlistData.thumbnails.length > 0 
          ? (playlistData.thumbnails.length > 1 ? playlistData.thumbnails[1].url : playlistData.thumbnails[0].url)
          : 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=300&h=300&fit=crop',
      },
      tracks 
    });
  } catch (error) {
    console.error('Playlist error:', error);
    return NextResponse.json({ error: 'Failed to fetch playlist' }, { status: 500 });
  }
}
