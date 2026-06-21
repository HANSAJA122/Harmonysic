const YTMusic = require('ytmusic-api');

async function test() {
  const ytmusic = new YTMusic();
  await ytmusic.initialize();
  
  try {
      const songData = await ytmusic.getSong('QKYg9AKoyZ4');
      console.log('Song data keys:', Object.keys(songData));
      
      const lyrics = await ytmusic.getLyrics('QKYg9AKoyZ4');
      console.log('Lyrics:', lyrics ? lyrics.substring(0, 50) + '...' : 'No lyrics');
  } catch (e) {
      console.error('Failed:', e.message);
  }
}

test();
