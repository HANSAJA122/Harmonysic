const YTMusic = require('ytmusic-api');

async function test() {
  const ytmusic = new YTMusic();
  await ytmusic.initialize();
  
  const albumData = await ytmusic.getAlbum('MPREb_97EeMAFmEU9');
  console.log(albumData.songs[0]);
}

test();
