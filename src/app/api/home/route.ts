import { NextResponse } from 'next/server';
import YTMusic from 'ytmusic-api';

const ytmusic = new YTMusic();

export async function GET() {
  try {
    await ytmusic.initialize();
    const results = await ytmusic.search('Global Top 50 Songs');
    
    // Parse Tracks
    const tracks = results
      .filter((item: any) => item.type === 'SONG' && item.videoId)
      .map((item: any) => ({
        id: item.videoId,
        title: item.name,
        artist: item.artist?.name || 'Unknown Artist',
        album: item.album?.name || 'Single',
        albumUrl: item.thumbnails && item.thumbnails.length > 0 
          ? (item.thumbnails.length > 1 ? item.thumbnails[1].url : item.thumbnails[0].url)
          : 'https://images.unsplash.com/photo-1614680376573-df3480f0c6ff?w=300&h=300&fit=crop',
        duration: item.duration || 180,
      }))
      .slice(0, 10);

    // Fetch Playlists
    const playlistResults = await ytmusic.search('Top Playlists');
    const playlists = playlistResults
      .filter((item: any) => item.type === 'PLAYLIST' && item.playlistId?.startsWith('PL'))
      .map((item: any) => ({
        id: item.playlistId,
        title: item.name,
        description: item.author || 'YouTube Music',
        imageUrl: item.thumbnails && item.thumbnails.length > 0 
          ? (item.thumbnails.length > 1 ? item.thumbnails[1].url : item.thumbnails[0].url)
          : 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=300&h=300&fit=crop',
        type: 'playlist'
      }))
      .slice(0, 6);

    // If we didn't find enough, search again with a different term
    if (playlists.length < 6) {
        const fallbackResults = await ytmusic.search('Best music playlists');
        const fallbackPlaylists = fallbackResults
          .filter((item: any) => item.type === 'PLAYLIST' && item.playlistId?.startsWith('PL'))
          .map((item: any) => ({
            id: item.playlistId,
            title: item.name,
            description: item.author || 'YouTube Music',
            imageUrl: item.thumbnails && item.thumbnails.length > 0 
              ? (item.thumbnails.length > 1 ? item.thumbnails[1].url : item.thumbnails[0].url)
              : 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=300&h=300&fit=crop',
            type: 'playlist'
          }));
        
        playlists.push(...fallbackPlaylists.slice(0, 6 - playlists.length));
    }

    // Fetch Artists
    const artistResults = await ytmusic.search('Top Global Artists');
    const artists = artistResults
      .filter((item: any) => item.type === 'ARTIST' && item.artistId)
      .map((item: any) => ({
        id: item.artistId,
        title: item.name,
        description: 'Artist',
        imageUrl: item.thumbnails && item.thumbnails.length > 0 
          ? (item.thumbnails.length > 1 ? item.thumbnails[1].url : item.thumbnails[0].url)
          : 'https://images.unsplash.com/photo-1493225457124-a1a2a5f5f92e?w=300&h=300&fit=crop',
        type: 'artist'
      }))
      .slice(0, 6);

    return NextResponse.json({ tracks, playlists, artists });
  } catch (error) {
    console.error('Home error:', error);
    return NextResponse.json({ error: 'Failed to fetch home results' }, { status: 500 });
  }
}
