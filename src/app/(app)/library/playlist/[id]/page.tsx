"use client";

import React from 'react';
import { usePlayerStore } from '@/store/playerStore';
import { Play, Clock3, Music, Trash2 } from 'lucide-react';
import { SongCard } from '@/components/UI/SongCard';
import { useParams, useRouter } from 'next/navigation';
import '../../liked-songs/LikedSongs.css';

export default function CustomPlaylistPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const { userPlaylists, setQueue, removeSongFromPlaylist } = usePlayerStore();

  const playlist = userPlaylists.find(p => p.id === id);

  if (!playlist) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', color: 'var(--color-text-secondary)' }}>
        Playlist not found
      </div>
    );
  }

  const handlePlayAll = () => {
    if (playlist.tracks.length > 0) {
      setQueue(playlist.tracks, 0);
    }
  };

  return (
    <div className="liked-songs-page animate-fade-in">
      <div className="playlist-header">
        <div className="playlist-artwork" style={{ backgroundColor: 'var(--color-surface-hover)' }}>
          {playlist.tracks.length > 0 && playlist.tracks[0].albumUrl ? (
            <img src={playlist.tracks[0].albumUrl} alt={playlist.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            <Music size={64} color="var(--color-text-secondary)" />
          )}
        </div>
        <div className="playlist-header-info">
          <span className="playlist-type">Playlist</span>
          <h1 className="playlist-title">{playlist.title}</h1>
          <div className="playlist-meta">
            <span>{playlist.tracks.length} songs</span>
          </div>
        </div>
      </div>

      <div className="playlist-actions">
        <button 
          className="btn-play-large"
          onClick={handlePlayAll}
          disabled={playlist.tracks.length === 0}
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
          {playlist.tracks.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', color: 'var(--color-text-secondary)' }}>
              This playlist is empty. Add songs to it from the options menu on any track.
            </div>
          ) : (
            playlist.tracks.map((track: any, i: number) => (
              <div key={track.id} style={{ position: 'relative' }}>
                <SongCard 
                  track={track} 
                  index={i} 
                  onClick={() => setQueue(playlist.tracks, i)}
                />
                <button 
                  onClick={() => removeSongFromPlaylist(playlist.id, track.id)}
                  style={{
                    position: 'absolute',
                    right: '16px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--color-text-secondary)',
                    cursor: 'pointer',
                    padding: '8px',
                    zIndex: 2
                  }}
                  title="Remove from playlist"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
