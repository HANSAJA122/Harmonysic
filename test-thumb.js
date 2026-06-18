const YTMusic = require('ytmusic-api');

async function test() {
  const ytmusic = new YTMusic();
  await ytmusic.initialize();
  const searchResults = await ytmusic.search('Top Playlists');
  const playlists = searchResults.filter(r => r.type === 'PLAYLIST' && r.playlistId && r.playlistId.startsWith('PL'));
  
  playlists.slice(0, 3).forEach(p => {
    console.log(p.name, p.thumbnails);
  });
}

test();
