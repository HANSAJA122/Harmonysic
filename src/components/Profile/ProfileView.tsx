"use client";

import React, { useMemo } from 'react';
import { usePlayerStore } from '@/store/playerStore';
import { useAuthStore } from '@/store/authStore';
import { Clock, Heart, PlayCircle, User, Sun, Moon, CalendarDays } from 'lucide-react';
import MonthlyRecapModal from './MonthlyRecapModal';
import './ProfileView.css';

export default function ProfileView() {
  const { user } = useAuthStore();
  const { likedSongs, setQueue, theme, toggleTheme, listeningStats } = usePlayerStore();
  const [isRecapOpen, setIsRecapOpen] = React.useState(false);

  // Aggregate stats from listeningStats (Current Month)
  const stats = useMemo(() => {
    const totalLiked = likedSongs.length;
    const month = new Date().toISOString().substring(0, 7);
    const currentMonthStats = listeningStats[month] || {
      totalSeconds: 0,
      tracksPlayed: 0,
      topArtists: {},
      topTracks: {}
    };
    
    const topArtists = Object.entries(currentMonthStats.topArtists)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, count]) => ({ name, count }));

    const topTracks = Object.values(currentMonthStats.topTracks)
      .sort((a, b) => b.count - a.count)
      .slice(0, 10)
      .map(t => t.track);

    const totalMinutes = Math.floor(currentMonthStats.totalSeconds / 60);

    return {
      totalLiked,
      totalRecentlyPlayed: currentMonthStats.tracksPlayed,
      topArtists,
      topTracks,
      totalMinutes,
      month
    };
  }, [likedSongs, listeningStats]);

  if (!user) {
    return (
      <div className="profile-container">
        <div className="profile-empty">
          <User size={64} />
          <h2>Log in to see your stats</h2>
          <p>We need to know who you are to show your listening history.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-container">
      {/* Header */}
      <div className="profile-header">
        <div className="profile-avatar-large">
          {user.photoURL ? (
            <img src={user.photoURL} alt="Profile" />
          ) : (
            <User size={64} />
          )}
        </div>
        <div className="profile-header-info">
          <div className="profile-label">Profile</div>
          <h1 className="profile-name">{user.displayName || 'Music Fan'}</h1>
          <div className="profile-meta">
            <span>{stats.totalLiked} Liked Songs</span>
            <span>•</span>
            <span>{stats.totalMinutes} Minutes Listened</span>
          </div>
        </div>
      </div>

      <div className="profile-content">
        <div className="profile-grid">
          {/* Top Artists */}
          <div className="profile-section">
            <h2 className="section-title">Your Top Artists</h2>
            <div className="artist-list">
              {stats.topArtists.length > 0 ? (
                stats.topArtists.map((artist, idx) => (
                  <div key={artist.name} className="artist-card">
                    <div className="artist-rank">{idx + 1}</div>
                    <div className="artist-info">
                      <div className="artist-name">{artist.name}</div>
                      <div className="artist-plays">{artist.count} interactions</div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="empty-state">No artists found yet. Start listening!</div>
              )}
            </div>
          </div>

          {/* Quick Stats */}
          <div className="profile-section">
            <h2 className="section-title">Listening Stats</h2>
            <div className="stats-grid">
              <div className="stat-card">
                <Clock size={32} className="stat-icon" />
                <div className="stat-value">{stats.totalMinutes}</div>
                <div className="stat-label">Minutes Listened</div>
              </div>
              <div className="stat-card">
                <PlayCircle size={32} className="stat-icon" />
                <div className="stat-value">{stats.totalRecentlyPlayed}</div>
                <div className="stat-label">Tracks Played</div>
              </div>
              <div className="stat-card">
                <Heart size={32} className="stat-icon" />
                <div className="stat-value">{stats.totalLiked}</div>
                <div className="stat-label">Liked Songs</div>
              </div>
            </div>
          </div>
        </div>

        {/* Recap Section */}
        <div className="profile-section mt-8" style={{ background: 'linear-gradient(135deg, var(--color-primary), #9d4edd)', borderRadius: 'var(--radius-lg)', padding: '24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '24px' }}>
          <div>
            <h2 style={{ color: '#fff', fontSize: '24px', fontWeight: 'bold', marginBottom: '8px' }}>Your Monthly Recap</h2>
            <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '14px' }}>See what you've been listening to this month.</p>
          </div>
          <button 
            onClick={() => setIsRecapOpen(true)}
            style={{ background: '#fff', color: 'var(--color-primary)', border: 'none', padding: '12px 24px', borderRadius: 'var(--radius-full)', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            <CalendarDays size={20} />
            View Recap
          </button>
        </div>

        {/* Top Tracks */}
        <div className="profile-section mt-8" style={{ marginTop: '24px' }}>
          <h2 className="section-title">Your Most Played Songs</h2>
          <div className="track-list">
            {stats.topTracks.length > 0 ? (
              stats.topTracks.map((track, index) => (
                <div 
                  key={track.id + index} 
                  className="track-row"
                  onClick={() => setQueue(stats.topTracks, index)}
                >
                  <div className="track-rank">{index + 1}</div>
                  <img src={track.albumUrl} alt={track.title} className="track-img" />
                  <div className="track-details">
                    <div className="track-title">{track.title}</div>
                    <div className="track-artist">{track.artist}</div>
                  </div>
                </div>
              ))
            ) : (
              <div className="empty-state">No tracks found yet. Start listening!</div>
            )}
          </div>
        </div>

        {/* Settings */}
        <div className="profile-section mt-8">
          <h2 className="section-title">Preferences</h2>
          <div className="settings-list" style={{ display: 'flex', gap: '16px', flexDirection: 'column' }}>
            <div className="setting-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--color-surface)', padding: '16px', borderRadius: 'var(--radius-md)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                {theme === 'dark' ? <Moon size={24} color="var(--color-primary)" /> : <Sun size={24} color="var(--color-primary)" />}
                <div>
                  <h3 style={{ fontSize: '16px', fontWeight: '500', marginBottom: '4px' }}>App Theme</h3>
                  <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)' }}>Toggle between Light and Dark mode.</p>
                </div>
              </div>
              <button 
                onClick={toggleTheme}
                style={{
                  background: 'var(--color-primary)',
                  color: '#fff',
                  border: 'none',
                  padding: '8px 16px',
                  borderRadius: 'var(--radius-full)',
                  fontWeight: '600',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                {theme === 'dark' ? 'Switch to Light' : 'Switch to Dark'}
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {isRecapOpen && <MonthlyRecapModal stats={stats} onClose={() => setIsRecapOpen(false)} />}
    </div>
  );
}
