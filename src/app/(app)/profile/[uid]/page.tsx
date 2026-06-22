"use client";

import React, { useEffect, useState, useMemo } from 'react';
import { useParams } from 'next/navigation';
import { db } from '@/lib/firebase';
import { doc, getDoc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { useAuthStore } from '@/store/authStore';
import { Clock, Heart, PlayCircle, User, UserPlus, UserMinus } from 'lucide-react';
import '@/components/Profile/ProfileView.css';
import { usePlayerStore } from '@/store/playerStore';

export default function PublicProfileView() {
  const { uid } = useParams() as { uid: string };
  const { user: currentUser, openLoginModal } = useAuthStore();
  const { setQueue } = usePlayerStore();
  
  const [profileUser, setProfileUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const userDoc = await getDoc(doc(db, 'users', uid));
        if (userDoc.exists()) {
          setProfileUser(userDoc.data());
        }
      } catch (error) {
        console.error("Error fetching user profile:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProfile();
  }, [uid]);

  useEffect(() => {
    // Check if current user is following this user
    const checkFollowing = async () => {
      if (!currentUser) return;
      try {
        const meDoc = await getDoc(doc(db, 'users', currentUser.uid));
        if (meDoc.exists()) {
          const myData = meDoc.data();
          if (myData.following && myData.following.includes(uid)) {
            setIsFollowing(true);
          }
        }
      } catch (error) {
        console.error("Error checking follow status:", error);
      }
    };
    checkFollowing();
  }, [currentUser, uid]);

  const handleFollowToggle = async () => {
    if (!currentUser) {
      openLoginModal();
      return;
    }
    
    try {
      const meRef = doc(db, 'users', currentUser.uid);
      const themRef = doc(db, 'users', uid);

      if (isFollowing) {
        await updateDoc(meRef, { following: arrayRemove(uid) });
        await updateDoc(themRef, { followers: arrayRemove(currentUser.uid) });
        setIsFollowing(false);
      } else {
        await updateDoc(meRef, { following: arrayUnion(uid) });
        await updateDoc(themRef, { followers: arrayUnion(currentUser.uid) });
        setIsFollowing(true);
      }
    } catch (error) {
      console.error("Error toggling follow:", error);
    }
  };

  const stats = useMemo(() => {
    if (!profileUser) return null;
    
    const likedSongs = profileUser.likedSongs || [];
    const recentlyPlayed = profileUser.recentlyPlayed || [];
    
    const totalLiked = likedSongs.length;
    const totalRecentlyPlayed = recentlyPlayed.length;
    
    const artistCounts: Record<string, number> = {};
    const trackPlayCounts: Record<string, { track: any, count: number }> = {};
    
    const allTracks = [...likedSongs, ...recentlyPlayed];
    
    allTracks.forEach(track => {
      if (track.artist) {
        artistCounts[track.artist] = (artistCounts[track.artist] || 0) + 1;
      }
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

    const totalMinutes = totalRecentlyPlayed * 3;

    return { totalLiked, totalRecentlyPlayed, topArtists, topTracks, totalMinutes };
  }, [profileUser]);

  if (isLoading) {
    return <div className="profile-container"><div className="profile-empty">Loading...</div></div>;
  }

  if (!profileUser) {
    return (
      <div className="profile-container">
        <div className="profile-empty">
          <User size={64} />
          <h2>User not found</h2>
          <p>This profile doesn't exist or has been deleted.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-container animate-fade-in">
      {/* Header */}
      <div className="profile-header">
        <div className="profile-avatar-large">
          {profileUser.photoURL ? (
            <img src={profileUser.photoURL} alt="Profile" />
          ) : (
            <User size={64} />
          )}
        </div>
        <div className="profile-header-info">
          <div className="profile-label">Profile</div>
          <h1 className="profile-name">{profileUser.displayName || 'Music Fan'}</h1>
          <div className="profile-meta">
            <span>{profileUser.followers?.length || 0} Followers</span>
            <span>•</span>
            <span>{profileUser.following?.length || 0} Following</span>
          </div>
          
          {currentUser && currentUser.uid !== uid && (
            <button 
              className={`follow-btn ${isFollowing ? 'following' : ''}`}
              onClick={handleFollowToggle}
              style={{
                marginTop: '16px',
                padding: '8px 24px',
                borderRadius: '500px',
                border: '1px solid var(--color-text-secondary)',
                background: isFollowing ? 'transparent' : 'var(--color-text-primary)',
                color: isFollowing ? 'var(--color-text-primary)' : 'var(--color-background)',
                fontWeight: 'bold',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              {isFollowing ? (
                <><UserMinus size={18} /> Following</>
              ) : (
                <><UserPlus size={18} /> Follow</>
              )}
            </button>
          )}
        </div>
      </div>

      {stats && (
        <div className="profile-content">
          <div className="profile-grid">
            <div className="profile-section">
              <h2 className="section-title">Top Artists</h2>
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
                  <div className="empty-state">No artists found yet.</div>
                )}
              </div>
            </div>

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

          <div className="profile-section mt-8">
            <h2 className="section-title">Most Played Songs</h2>
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
                <div className="empty-state">No tracks found yet.</div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
