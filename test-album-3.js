const YTMusic = require('ytmusic-api');

async function test() {
  const ytmusic = new YTMusic();
  await ytmusic.initialize();
  
  try {
      const albumData = await ytmusic.getAlbum('MPREb_97EeMAFmEU9');
      console.log('getAlbum worked:', albumData.name, 'Tracks:', albumData.songs.length);
  } catch (e) {
      console.error('getAlbum failed:', e.message);
  }
}

test();
