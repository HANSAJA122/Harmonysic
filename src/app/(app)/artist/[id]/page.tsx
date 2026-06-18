'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Play, CheckCircle2 } from 'lucide-react';
import { usePlayerStore } from '@/store/playerStore';
import TrackList from '@/components/Playlist/TrackList';
import { MediaCard } from '@/components/UI/MediaCard';
import './Artist.css';

interface ArtistData {
  artist: {
    id: string;
    name: string;
    imageUrl: string;
  };
  topSongs: any[];
  albums: any[];
}

export default function ArtistPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const { setQueue } = usePlayerStore();

  const [data, setData] = useState<ArtistData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchArtist = async () => {
      try {
        const response = await fetch(`/api/artist?id=${id}`);
        if (!response.ok) {
          throw new Error('Failed to fetch artist');
        }
        const result = await response.json();
        setData(result);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchArtist();
    }
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full" style={{ minHeight: '50vh' }}>
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center" style={{ minHeight: '50vh' }}>
        <h2 className="text-2xl font-bold mb-4">Artist Not Found</h2>
        <p className="text-gray-400 mb-6">We couldn't find the artist you're looking for.</p>
        <button 
          onClick={() => router.push('/')}
          className="px-6 py-3 bg-white text-black rounded-full font-bold hover:scale-105 transition-transform"
        >
          Go Home
        </button>
      </div>
    );
  }

  const handlePlayAll = () => {
    if (data.topSongs.length > 0) {
      setQueue(data.topSongs, 0);
    }
  };

  return (
    <div className="artist-page">
      <div 
        className="artist-header"
        style={{ backgroundImage: `url(${data.artist.imageUrl})` }}
      >
        <div className="artist-header-overlay"></div>
        <div className="artist-info">
          <div className="artist-type">
            <CheckCircle2 size={16} className="verified-badge" fill="currentColor" color="white" />
            Verified Artist
          </div>
          <h1 className="artist-title">{data.artist.name}</h1>
        </div>
      </div>

      <div className="artist-actions-row">
        <button className="artist-play-btn" onClick={handlePlayAll}>
          <Play size={28} fill="currentColor" style={{ marginLeft: '4px' }} />
        </button>
      </div>

      <div className="artist-content">
        <section className="artist-top-songs">
          <h2 className="artist-section-title">Popular</h2>
          <TrackList tracks={data.topSongs} onTrackSelect={(index) => setQueue(data.topSongs, index)} />
        </section>

        {data.albums && data.albums.length > 0 && (
          <section className="artist-albums">
            <h2 className="artist-section-title">Discography</h2>
            <div className="horizontal-scroll-container">
              {data.albums.map((album) => (
                <div key={album.id} className="scroll-item">
                  <MediaCard 
                    item={album} 
                    onClick={() => router.push(`/playlist/${album.id}`)} 
                  />
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
