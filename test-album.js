const YTMusic = require('ytmusic-api');

async function test() {
  const ytmusic = new YTMusic();
  await ytmusic.initialize();
  
  const searchResults = await ytmusic.search('Ed Sheeran');
  const artist = searchResults.find(r => r.type === 'ARTIST');
  
  if (artist && artist.artistId) {
      const artistData = await ytmusic.getArtist(artist.artistId);
      console.log('Top albums:', artistData.topAlbums.length);
      if (artistData.topAlbums.length > 0) {
        const album = artistData.topAlbums[0];
        console.log('First Album ID:', album.browseId || album.playlistId);
        
        try {
          const albumData = await ytmusic.getAlbum(album.browseId || album.playlistId);
          console.log('Album data fetched:', albumData.name, 'Tracks:', albumData.songs.length);
        } catch(e) {
          console.error('getAlbum failed:', e.message);
          try {
            const playlistData = await ytmusic.getPlaylist(album.browseId || album.playlistId);
            console.log('getPlaylist worked:', playlistData.name, 'Tracks:', playlistData.videos.length);
          } catch(e2) {
             console.error('getPlaylist failed:', e2.message);
          }
        }
      }
      console.log('Does artist have featuredOn? ', !!artistData.featuredOn);
      if (artistData.featuredOn && artistData.featuredOn.length > 0) {
          console.log('First featuredOn:', artistData.featuredOn[0].name, artistData.featuredOn[0].playlistId);
      }
  }
}

test();
