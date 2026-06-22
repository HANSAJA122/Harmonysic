"use client";

import React, { useState } from 'react';
import { Sparkles, Loader2, Music, Save, Play } from 'lucide-react';
import { usePlayerStore, Track } from '@/store/playerStore';
import { useAuthStore } from '@/store/authStore';

export default function AIPlaylistPage() {
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [playlist, setPlaylist] = useState<{name: string, tracks: Track[]} | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const { setCurrentTrack, setIsPlaying, setQueue, createPlaylist, addSongToPlaylist, userPlaylists } = usePlayerStore();
  const { user } = useAuthStore();

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    setIsLoading(true);
    setError(null);
    setPlaylist(null);
    setSavedSuccess(false);

    try {
      const res = await fetch('/api/generate-playlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to generate playlist');
      }

      setPlaylist({
        name: data.playlistName,
        tracks: data.tracks
      });
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePlayAll = () => {
    if (!playlist || playlist.tracks.length === 0) return;
    setQueue(playlist.tracks);
    setCurrentTrack(playlist.tracks[0]);
    setIsPlaying(true);
  };

  const handleSavePlaylist = async () => {
    if (!playlist || playlist.tracks.length === 0 || !user) return;
    setIsSaving(true);
    try {
      await createPlaylist(playlist.name);
      
      // Wait a moment for the state to update (since createPlaylist updates userPlaylists)
      // A more robust way is to find the latest playlist created by this user
      setTimeout(async () => {
        const state = usePlayerStore.getState();
        const newPlaylist = state.userPlaylists[state.userPlaylists.length - 1];
        
        if (newPlaylist) {
          for (const track of playlist.tracks) {
             await state.addSongToPlaylist(newPlaylist.id, track);
          }
          setSavedSuccess(true);
        }
        setIsSaving(false);
      }, 1000);
      
    } catch (err) {
      console.error("Failed to save playlist", err);
      setIsSaving(false);
    }
  };

  return (
    <div style={{ padding: '32px', maxWidth: '900px', margin: '0 auto', color: 'white', animation: 'fadeIn 0.4s ease-out' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '32px' }}>
        <div style={{ 
          width: '64px', height: '64px', borderRadius: '16px', 
          background: 'linear-gradient(135deg, #a8ff78 0%, #78ffd6 100%)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: '#000'
        }}>
          <Sparkles size={32} fill="currentColor" />
        </div>
        <div>
          <h1 style={{ fontSize: '32px', fontWeight: 800, margin: 0 }}>AI Playlist Generator</h1>
          <p style={{ color: 'var(--color-text-secondary)', margin: '8px 0 0 0', fontSize: '16px' }}>
            Describe the vibe, and Gemini will curate the perfect tracklist.
          </p>
        </div>
      </div>

      <form onSubmit={handleGenerate} style={{ marginBottom: '40px' }}>
        <div style={{ display: 'flex', gap: '16px' }}>
          <input
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="e.g., Upbeat workout songs from the 2010s..."
            disabled={isLoading}
            style={{
              flex: 1,
              padding: '16px 24px',
              borderRadius: '999px',
              border: 'none',
              background: 'var(--color-surface-elevated)',
              color: 'white',
              fontSize: '16px',
              outline: 'none',
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
            }}
          />
          <button
            type="submit"
            disabled={isLoading || !prompt.trim()}
            style={{
              padding: '0 32px',
              borderRadius: '999px',
              border: 'none',
              background: 'var(--color-primary)',
              color: 'black',
              fontWeight: 700,
              fontSize: '16px',
              cursor: isLoading || !prompt.trim() ? 'not-allowed' : 'pointer',
              opacity: isLoading || !prompt.trim() ? 0.7 : 1,
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              transition: 'transform 0.2s'
            }}
          >
            {isLoading ? <Loader2 className="animate-spin" /> : <Sparkles size={20} />}
            {isLoading ? 'Generating...' : 'Generate'}
          </button>
        </div>
      </form>

      {error && (
        <div style={{ padding: '16px', background: 'rgba(233, 20, 41, 0.1)', color: 'var(--color-danger)', borderRadius: '8px', marginBottom: '24px' }}>
          {error}
        </div>
      )}

      {playlist && (
        <div style={{ background: 'var(--color-surface-elevated)', borderRadius: '16px', padding: '24px', animation: 'fadeIn 0.5s ease-out' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <h2 style={{ fontSize: '24px', fontWeight: 700, margin: 0 }}>{playlist.name}</h2>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button 
                onClick={handlePlayAll}
                style={{
                  padding: '8px 24px', borderRadius: '999px', border: 'none',
                  background: 'var(--color-primary)', color: 'black', fontWeight: 700,
                  display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer'
                }}
              >
                <Play size={16} fill="currentColor" /> Play All
              </button>
              
              <button 
                onClick={handleSavePlaylist}
                disabled={isSaving || savedSuccess}
                style={{
                  padding: '8px 24px', borderRadius: '999px', 
                  border: '1px solid var(--color-text-secondary)',
                  background: 'transparent', color: 'white', fontWeight: 700,
                  display: 'flex', alignItems: 'center', gap: '8px', 
                  cursor: isSaving || savedSuccess ? 'default' : 'pointer',
                  opacity: savedSuccess ? 0.5 : 1
                }}
              >
                {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                {savedSuccess ? 'Saved to Library' : 'Save Playlist'}
              </button>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {playlist.tracks.map((track, idx) => (
              <div 
                key={idx}
                style={{ 
                  display: 'flex', alignItems: 'center', gap: '16px', 
                  padding: '12px', borderRadius: '8px', background: 'var(--color-surface)',
                  transition: 'background 0.2s'
                }}
                className="hover-bg-light"
              >
                <div style={{ width: '24px', textAlign: 'center', color: 'var(--color-text-secondary)', fontSize: '14px' }}>
                  {idx + 1}
                </div>
                <img src={track.albumUrl} alt="" style={{ width: '48px', height: '48px', borderRadius: '4px', objectFit: 'cover' }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{track.title}</div>
                  <div style={{ color: 'var(--color-text-secondary)', fontSize: '14px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{track.artist}</div>
                </div>
                <button 
                  onClick={() => {
                    setQueue([track]);
                    setCurrentTrack(track);
                    setIsPlaying(true);
                  }}
                  style={{
                    width: '40px', height: '40px', borderRadius: '50%', border: 'none',
                    background: 'transparent', color: 'white', display: 'flex', 
                    alignItems: 'center', justifyContent: 'center', cursor: 'pointer'
                  }}
                >
                  <Play size={20} fill="currentColor" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
