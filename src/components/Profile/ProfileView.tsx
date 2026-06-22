"use client";

import React, { useMemo } from 'react';
import { usePlayerStore } from '@/store/playerStore';
import { useAuthStore } from '@/store/authStore';
import { Clock, Heart, PlayCircle, User } from 'lucide-react';
import './ProfileView.css';

export default function ProfileView() {
  const { user } = useAuthStore();
  const { likedSongs, recentlyPlayed, setQueue } = usePlayerStore();

  // Aggregate stats
  const stats = useMemo(() => {
    const totalLiked = likedSongs.length;
    const totalRecentlyPlayed = recentlyPlayed.length;
    
    // Combine liked and recently played to find top artists
    const artistCounts: Record<string, number> = {};
    const trackPlayCounts: Record<string, { track: any, count: number }> = {};
    
    const allTracks = [...likedSongs, ...recentlyPlayed];
    
    allTracks.forEach(track => {
      // Count Artists
      if (track.artist) {
        artistCounts[track.artist] = (artistCounts[track.artist] || 0) + 1;
      }
      // Count specific tracks (using ID as key)
      if (track.id) {
        if (!trackPlayCounts[track.id]) {
          trackPlayCounts[track.id] = { track, count: 0 };
        }
        trackPlayCounts[track.id].count += 1;
      }
    });

    const topArtists = Object.entries(artistCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, count]) => ({ name, count }));

    const topTracks = Object.values(trackPlayCounts)
      .sort((a, b) => b.count - a.count)
      .slice(0, 10)
      .map(t => t.track);

    // Approximate listening time: 3 mins per track
    const totalMinutes = totalRecentlyPlayed * 3;

    return {
      totalLiked,
      totalRecentlyPlayed,
      topArtists,
      topTracks,
      totalMinutes
    };
  }, [likedSongs, recentlyPlayed]);

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

        {/* Top Tracks */}
        <div className="profile-section mt-8">
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
      </div>
    </div>
  );
}
