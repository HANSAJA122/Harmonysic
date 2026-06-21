import { NextResponse } from 'next/server';
import YTMusic from 'ytmusic-api';

const ytmusic = new YTMusic();

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get('q');

  if (!q) {
    return NextResponse.json({ error: 'Search query is required' }, { status: 400 });
  }

  try {
    await ytmusic.initialize();
    
    // Search for the query
    const results = await ytmusic.search(q);
    
    // Separate by type
    const songs = results.filter(r => r.type === 'SONG' || r.type === 'VIDEO').map((item: any) => ({
      id: item.videoId,
      title: item.name,
      artist: item.artist?.name || 'Unknown Artist',
      album: item.album?.name || 'Unknown Album',
      albumUrl: item.thumbnails && item.thumbnails.length > 0 
        ? (item.thumbnails.length > 1 ? item.thumbnails[1].url : item.thumbnails[0].url)
        : 'https://images.unsplash.com/photo-1614680376573-df3480f0c6ff?w=300&h=300&fit=crop',
      duration: item.duration || 180,
    }));

    const artists = results.filter(r => r.type === 'ARTIST').map((item: any) => ({
      id: item.artistId,
      title: item.name,
      subtitle: 'Artist',
      imageUrl: item.thumbnails && item.thumbnails.length > 0 
        ? (item.thumbnails.length > 1 ? item.thumbnails[1].url : item.thumbnails[0].url)
        : 'https://images.unsplash.com/photo-1493225457124-a1a2a5f5f92e?w=300&h=300&fit=crop',
      type: 'artist'
    }));

    const albums = results.filter(r => r.type === 'ALBUM').map((item: any) => ({
      id: item.albumId || item.playlistId || item.browseId,
      title: item.name,
      subtitle: item.artist?.name || 'Unknown Artist',
      imageUrl: item.thumbnails && item.thumbnails.length > 0 
        ? (item.thumbnails.length > 1 ? item.thumbnails[1].url : item.thumbnails[0].url)
        : 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=300&h=300&fit=crop',
      type: 'album'
    }));

    const playlists = results.filter(r => r.type === 'PLAYLIST').map((item: any) => ({
      id: item.playlistId,
      title: item.name,
      subtitle: item.author || 'YouTube Music',
      imageUrl: item.thumbnails && item.thumbnails.length > 0 
        ? (item.thumbnails.length > 1 ? item.thumbnails[1].url : item.thumbnails[0].url)
        : 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=300&h=300&fit=crop',
      type: 'playlist'
    }));

    return NextResponse.json({ 
      songs: songs.slice(0, 10), 
      artists: artists.slice(0, 5), 
      albums: albums.slice(0, 10), 
      playlists: playlists.slice(0, 10) 
    });
  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json({ error: 'Failed to perform search' }, { status: 500 });
  }
}
