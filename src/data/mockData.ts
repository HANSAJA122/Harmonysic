import type { Track } from '../store/playerStore';
import type { MediaItem } from '../components/UI/MediaCard';

export const mockTracks: Track[] = [
  {
    id: '1',
    title: 'Midnight City',
    artist: 'M83',
    albumUrl: 'https://i.scdn.co/image/ab67616d0000b273b320d5ea6af9509df134fb33',
    duration: 243
  },
  {
    id: '2',
    title: 'Blinding Lights',
    artist: 'The Weeknd',
    albumUrl: 'https://i.scdn.co/image/ab67616d0000b2738863bc11d2aa12b54f5aeb36',
    duration: 200
  },
  {
    id: '3',
    title: 'Levitating',
    artist: 'Dua Lipa',
    albumUrl: 'https://i.scdn.co/image/ab67616d0000b273bd26ede1ae69327010d49946',
    duration: 203
  },
  {
    id: '4',
    title: 'Watermelon Sugar',
    artist: 'Harry Styles',
    albumUrl: 'https://i.scdn.co/image/ab67616d0000b27377fdcfda6535601aff081b6a',
    duration: 174
  },
  {
    id: '5',
    title: 'Stay',
    artist: 'The Kid LAROI, Justin Bieber',
    albumUrl: 'https://i.scdn.co/image/ab67616d0000b27341e31d6ea1d493dd77933ee5',
    duration: 141
  }
];

export const mockPlaylists: MediaItem[] = [
  {
    id: 'p1',
    title: 'Today\'s Top Hits',
    subtitle: 'The Weeknd is on top of the Hottest 50!',
    imageUrl: 'https://i.scdn.co/image/ab67706f0000000346e9df0eb8ab3ba3fcded934',
    type: 'playlist'
  },
  {
    id: 'p2',
    title: 'RapCaviar',
    subtitle: 'New music from Drake, Travis Scott, and more.',
    imageUrl: 'https://i.scdn.co/image/ab67706f00000003b070440bf571ec87d4981df9',
    type: 'playlist'
  },
  {
    id: 'p3',
    title: 'Viva Latino',
    subtitle: 'Today\'s top Latin hits, elevando nuestra música.',
    imageUrl: 'https://i.scdn.co/image/ab67706f000000036ca6d506692cd319f3900dc2',
    type: 'playlist'
  },
  {
    id: 'p4',
    title: 'Rock Classics',
    subtitle: 'Rock legends & epic songs that continue to inspire.',
    imageUrl: 'https://i.scdn.co/image/ab67706f00000003b0d5c07c1341c59050d53c30',
    type: 'playlist'
  }
];

export const mockArtists: MediaItem[] = [
  {
    id: 'a1',
    title: 'The Weeknd',
    subtitle: 'Artist',
    imageUrl: 'https://i.scdn.co/image/ab6761610000e5eb214f3cf1cbe7139c1e26ffbb',
    type: 'artist'
  },
  {
    id: 'a2',
    title: 'Taylor Swift',
    subtitle: 'Artist',
    imageUrl: 'https://i.scdn.co/image/ab6761610000e5eb5a00969a4698c3132a15fbb0',
    type: 'artist'
  },
  {
    id: 'a3',
    title: 'Drake',
    subtitle: 'Artist',
    imageUrl: 'https://i.scdn.co/image/ab6761610000e5eb4293385d324db8558179afd9',
    type: 'artist'
  },
  {
    id: 'a4',
    title: 'Bad Bunny',
    subtitle: 'Artist',
    imageUrl: 'https://i.scdn.co/image/ab6761610000e5eb9e3ceaeb6cb242d421756cf0',
    type: 'artist'
  }
];

export const mockCategories = [
  { id: 'c1', name: 'Pop', color: '#8d67ab' },
  { id: 'c2', name: 'Hip-Hop', color: '#ba5d07' },
  { id: 'c3', name: 'Rock', color: '#e1118c' },
  { id: 'c4', name: 'Latin', color: '#e13300' },
  { id: 'c5', name: 'Dance/Electronic', color: '#d84000' },
  { id: 'c6', name: 'Indie', color: '#e91429' },
  { id: 'c7', name: 'R&B', color: '#dc148c' },
  { id: 'c8', name: 'Country', color: '#d84000' },
];
