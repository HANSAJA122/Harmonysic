"use client";

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Play, Heart, MoreHorizontal, Camera, GripVertical, Trash2 } from 'lucide-react';
import { SongCard } from '@/components/UI/SongCard';
import { usePlayerStore, Track } from '@/store/playerStore';
import { storage } from '@/lib/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import './Playlist.css';
import './Playlist.css';

const PlaylistPage: React.FC = () => {
  const params = useParams();
  const id = params.id as string;
  const { setQueue, savedPlaylists, toggleSavePlaylist, userPlaylists, updatePlaylistImage, reorderUserPlaylistTracks, removeSongFromPlaylist } = usePlayerStore();
  
  const [playlist, setPlaylist] = useState<any>(null);
  const [tracks, setTracks] = useState<Track[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  const isUserPlaylist = id.startsWith('playlist_');

  useEffect(() => {
    if (!id) return;

    if (isUserPlaylist) {
      // Find locally
      const found = userPlaylists.find(p => p.id === id);
      if (found) {
        setPlaylist(found);
        setTracks(found.tracks);
      }
      setIsLoading(false);
      return;
    }

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
    
    fetchPlaylist();
  }, [id, userPlaylists, isUserPlaylist]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0 || !isUserPlaylist) return;
    const file = e.target.files[0];
    setIsUploading(true);

    try {
      const storageRef = ref(storage, `playlists/${id}/${file.name}`);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);
      await updatePlaylistImage(id, url);
    } catch (err) {
      console.error('Failed to upload image', err);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDragStart = (e: React.DragEvent, index: number) => {
    if (!isUserPlaylist) return;
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    if (!isUserPlaylist || draggedIndex === null) return;
    e.preventDefault();
  };

  const handleDrop = async (e: React.DragEvent, index: number) => {
    if (!isUserPlaylist || draggedIndex === null) return;
    e.preventDefault();
    if (draggedIndex === index) {
      setDraggedIndex(null);
      return;
    }
    await reorderUserPlaylistTracks(id, draggedIndex, index);
    setDraggedIndex(null);
  };

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
        <div className="playlist-cover-container" style={{ position: 'relative', cursor: isUserPlaylist ? 'pointer' : 'default' }}>
          {playlist.imageUrl ? (
            <img src={playlist.imageUrl} alt={playlist.title} className="playlist-cover" />
          ) : (
            <div className="playlist-cover" style={{ background: '#282828', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
               <span style={{ fontSize: '48px', color: '#b3b3b3' }}>♪</span>
            </div>
          )}
          
          {isUserPlaylist && (
            <>
              <div className="playlist-cover-overlay">
                <Camera size={48} />
                <span>Choose photo</span>
              </div>
              <input 
                type="file" 
                accept="image/*" 
                onChange={handleImageUpload}
                disabled={isUploading}
                style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: 0, cursor: 'pointer' }} 
              />
            </>
          )}
        </div>
        <div className="playlist-info">
          <div className="playlist-type">{isUserPlaylist ? 'Public Playlist' : 'Playlist'}</div>
          <h1 className="playlist-title">{playlist.title}</h1>
          <div className="playlist-meta">
            {playlist.description && <span>{playlist.description}</span>}
            {playlist.description && <span className="dot">•</span>}
            <span>{tracks.length} songs</span>
            {isUploading && <span style={{ marginLeft: 16, color: 'var(--color-primary)' }}>Uploading image...</span>}
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
            <div 
              key={track.id + index}
              draggable={isUserPlaylist}
              onDragStart={(e) => handleDragStart(e, index)}
              onDragOver={(e) => handleDragOver(e, index)}
              onDrop={(e) => handleDrop(e, index)}
              style={{ display: 'flex', alignItems: 'center', opacity: draggedIndex === index ? 0.5 : 1 }}
            >
              {isUserPlaylist && (
                <div style={{ padding: '0 8px', color: 'var(--color-text-secondary)', cursor: 'grab' }}>
                  <GripVertical size={16} />
                </div>
              )}
              <div style={{ flex: 1 }}>
                <SongCard 
                  track={track} 
                  index={index}
                  onClick={() => setQueue(tracks, index)}
                />
              </div>
              {isUserPlaylist && (
                <button 
                  onClick={() => removeSongFromPlaylist(id, track.id)}
                  style={{ background: 'transparent', border: 'none', color: 'var(--color-text-secondary)', padding: '0 16px', cursor: 'pointer' }}
                  title="Remove from playlist"
                >
                  <Trash2 size={16} />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PlaylistPage;
