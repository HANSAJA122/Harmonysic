"use client";

import React, { useEffect } from 'react';
import { usePlayerStore } from '@/store/playerStore';
import { Play, Heart, Clock3 } from 'lucide-react';
import { SongCard } from '@/components/UI/SongCard';
import { useRouter } from 'next/navigation';
import './LikedSongs.css';

const LikedSongs: React.FC = () => {
  const { likedSongs, setQueue, currentTrack, isPlaying } = usePlayerStore();
  const router = useRouter();

  const handlePlayAll = () => {
    if (likedSongs.length > 0) {
      setQueue(likedSongs, 0);
    }
  };

  return (
    <div className="liked-songs-page animate-fade-in">
      <div className="playlist-header">
        <div className="playlist-artwork" style={{ background: 'linear-gradient(135deg, #450af5, #c4efd9)' }}>
          <Heart size={64} fill="white" stroke="white" />
        </div>
        <div className="playlist-header-info">
          <span className="playlist-type">Playlist</span>
          <h1 className="playlist-title">Liked Songs</h1>
          <div className="playlist-meta">
            <span>{likedSongs.length} songs</span>
          </div>
        </div>
      </div>

      <div className="playlist-actions">
        <button 
          className="btn-play-large"
          onClick={handlePlayAll}
          disabled={likedSongs.length === 0}
        >
          <Play size={24} fill="currentColor" />
        </button>
      </div>

      <div className="playlist-tracks">
        <div className="tracklist-header text-secondary">
          <div style={{ width: '24px', textAlign: 'center' }}>#</div>
          <div>Title</div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', paddingRight: '32px' }}>
            <Clock3 size={16} />
          </div>
        </div>
        
        <div className="track-list">
          {likedSongs.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', color: 'var(--color-text-secondary)' }}>
              Songs you like will appear here
            </div>
          ) : (
            likedSongs.map((track, i) => (
              <SongCard 
                key={track.id} 
                track={track} 
                index={i} 
                onClick={() => setQueue(likedSongs, i)}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default LikedSongs;
