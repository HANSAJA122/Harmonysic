"use client";

import React, { useEffect, useState } from 'react';
import { Bell, Clock, Settings } from 'lucide-react';
import { mockPlaylists, mockArtists } from '@/data/mockData';
import { MediaCard } from '@/components/UI/MediaCard';
import { SongCard } from '@/components/UI/SongCard';
import { Track } from '@/store/playerStore';
import './Home.css';

const Home: React.FC = () => {
  const [trendingTracks, setTrendingTracks] = useState<Track[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        const response = await fetch('/api/home');
        const data = await response.json();
        if (data.tracks) {
          setTrendingTracks(data.tracks);
        }
      } catch (error) {
        console.error('Failed to fetch home data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchHomeData();
  }, []);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div className="home-page animate-fade-in">
      <header className="home-header">
        <h1 className="greeting">{getGreeting()}</h1>
        <div className="header-actions">
          <button className="icon-btn"><Bell size={20} /></button>
          <button className="icon-btn"><Clock size={20} /></button>
          <button className="icon-btn"><Settings size={20} /></button>
        </div>
      </header>

      <section className="section">
        <div className="section-header">
          <h2 className="section-title">Trending Now (YouTube Music)</h2>
        </div>
        
        {isLoading ? (
          <div style={{ padding: '20px', color: 'var(--color-text-secondary)' }}>Loading live data...</div>
        ) : (
          <div className="tracks-grid">
            {trendingTracks.map(track => (
              <SongCard key={track.id} track={track} />
            ))}
          </div>
        )}
      </section>

      <section className="section">
        <div className="section-header">
          <h2 className="section-title">Made For You</h2>
          <button className="section-more">Show all</button>
        </div>
        <div className="horizontal-scroll">
          {mockPlaylists.map(playlist => (
            <div key={playlist.id} className="scroll-item">
              <MediaCard item={playlist} />
            </div>
          ))}
        </div>
      </section>

      <section className="section">
        <div className="section-header">
          <h2 className="section-title">Popular Artists</h2>
        </div>
        <div className="horizontal-scroll">
          {mockArtists.map(artist => (
            <div key={artist.id} className="scroll-item">
              <MediaCard item={artist} />
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Home;
