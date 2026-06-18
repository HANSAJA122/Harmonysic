"use client";

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Play, Heart, MoreHorizontal } from 'lucide-react';
import { SongCard } from '@/components/UI/SongCard';
import { usePlayerStore, Track } from '@/store/playerStore';
import './Playlist.css';

const PlaylistPage: React.FC = () => {
  const params = useParams();
  const id = params.id as string;
  const { setQueue, savedPlaylists, toggleSavePlaylist } = usePlayerStore();
  
  const [playlist, setPlaylist] = useState<any>(null);
  const [tracks, setTracks] = useState<Track[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPlaylist = async () => {
      try {
        const res = await fetch(`/api/playlist?id=${encodeURIComponent(id)}`);
        const data = await res.json();
        if (data.playlist) setPlaylist(data.playlist);
        if (data.tracks) setTracks(data.tracks);
      } catch (error) {
        console.error('Failed to fetch playlist', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    if (id) fetchPlaylist();
  }, [id]);

  if (isLoading) {
    return <div style={{ padding: '40px', color: 'var(--color-text-secondary)' }}>Loading playlist...</div>;
  }

  if (!playlist) {
    return <div style={{ padding: '40px', color: 'var(--color-text-secondary)' }}>Playlist not found.</div>;
  }

  const isSaved = savedPlaylists.some((p: any) => p.id === playlist.id);

  return (
    <div className="playlist-page animate-fade-in">
      <div className="playlist-header">
        <div className="playlist-cover-container">
          <img src={playlist.imageUrl} alt={playlist.title} className="playlist-cover" />
        </div>
        <div className="playlist-info">
          <div className="playlist-type">Playlist</div>
          <h1 className="playlist-title">{playlist.title}</h1>
          <div className="playlist-meta">
            {playlist.description && <span>{playlist.description}</span>}
            {playlist.description && <span className="dot">•</span>}
            <span>{tracks.length} songs</span>
          </div>
        </div>
      </div>

      <div className="playlist-actions-row">
        <button 
          className="playlist-play-btn"
          onClick={() => {
            if (tracks.length > 0) {
              setQueue(tracks, 0);
            }
          }}
        >
          <Play size={28} fill="currentColor" style={{ marginLeft: '4px' }} />
        </button>
        <button 
          className="playlist-action-icon"
          onClick={() => toggleSavePlaylist(playlist)}
          style={{ color: isSaved ? 'var(--color-primary)' : 'inherit' }}
        >
          <Heart size={32} fill={isSaved ? "currentColor" : "none"} />
        </button>
        <button className="playlist-action-icon">
          <MoreHorizontal size={32} />
        </button>
      </div>

      <div className="playlist-tracks">
        <div style={{ display: 'grid', gap: '8px' }}>
          {tracks.map((track, index) => (
            <SongCard 
              key={track.id} 
              track={track} 
              index={index}
              onClick={() => setQueue(tracks, index)}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default PlaylistPage;
