const YTMusic = require('ytmusic-api');

async function test() {
  const ytmusic = new YTMusic();
  await ytmusic.initialize();
  
  const searchResults = await ytmusic.search('Ed Sheeran');
  const artist = searchResults.find(r => r.type === 'ARTIST');
  
  if (artist && artist.artistId) {
      const artistData = await ytmusic.getArtist(artist.artistId);
      console.log('featuredOn[0]', artistData.featuredOn[0]);
  }
}

test();
