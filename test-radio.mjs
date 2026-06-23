import YTMusic from 'ytmusic-api';

async function main() {
  const ytmusic = new YTMusic();
  await ytmusic.initialize();
  const upNext = await ytmusic.getUpNexts('dQw4w9WgXcQ');
  console.log(upNext.slice(0, 3));
}
main().catch(console.error);
