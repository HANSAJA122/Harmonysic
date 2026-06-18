import { NextResponse } from 'next/server';
import YTMusic from 'ytmusic-api';

const ytmusic = new YTMusic();

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json({ error: 'Artist ID is required' }, { status: 400 });
  }

  try {
    await ytmusic.initialize();
    const artistData = await ytmusic.getArtist(id);
    
    // Process top songs into our Track format
    const topSongs = (artistData.topSongs || [])
      .filter((item: any) => item.videoId)
      .map((item: any) => ({
        id: item.videoId,
        title: item.name,
        artist: artistData.name,
        album: item.album?.name || 'Unknown',
        albumUrl: item.thumbnails && item.thumbnails.length > 0 
          ? (item.thumbnails.length > 1 ? item.thumbnails[1].url : item.thumbnails[0].url)
          : 'https://images.unsplash.com/photo-1614680376573-df3480f0c6ff?w=300&h=300&fit=crop',
        duration: item.duration || 180,
      }));

    // Process top albums/singles into our MediaCard format
    const albums = (artistData.topAlbums || []).map((item: any) => ({
      id: item.browseId || item.playlistId,
      title: item.name,
      description: item.year || 'Album',
      imageUrl: item.thumbnails && item.thumbnails.length > 0 
        ? (item.thumbnails.length > 1 ? item.thumbnails[1].url : item.thumbnails[0].url)
        : 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=300&h=300&fit=crop',
      type: 'album' // We can treat them as albums which can route to playlist page if browseId works as playlistId
    }));
    
    const singles = (artistData.topSingles || []).map((item: any) => ({
      id: item.browseId || item.playlistId,
      title: item.name,
      description: item.year || 'Single',
      imageUrl: item.thumbnails && item.thumbnails.length > 0 
        ? (item.thumbnails.length > 1 ? item.thumbnails[1].url : item.thumbnails[0].url)
        : 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=300&h=300&fit=crop',
      type: 'album'
    }));

    return NextResponse.json({ 
      artist: {
        id: artistData.artistId,
        name: artistData.name,
        imageUrl: artistData.thumbnails && artistData.thumbnails.length > 0 
          ? (artistData.thumbnails.length > 1 ? artistData.thumbnails[1].url : artistData.thumbnails[0].url)
          : 'https://images.unsplash.com/photo-1493225457124-a1a2a5f5f92e?w=300&h=300&fit=crop',
      },
      topSongs,
      albums: [...albums, ...singles]
    });
  } catch (error) {
    console.error('Artist API error:', error);
    return NextResponse.json({ error: 'Failed to fetch artist' }, { status: 500 });
  }
}
