const YTMusic = require('ytmusic-api');

async function test() {
  const ytmusic = new YTMusic();
  await ytmusic.initialize();
  
  try {
      const data = await ytmusic.getPlaylist('UCnfeNQJ7TgUCPCBD0q5Zh-Q');
      console.log('Worked!');
  } catch (e) {
      console.error('Failed:', e.message);
  }
}

test();
