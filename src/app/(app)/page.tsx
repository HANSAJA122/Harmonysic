"use client";

import React, { useEffect, useState } from 'react';
import { Bell, Clock, Settings } from 'lucide-react';
import { MediaCard } from '@/components/UI/MediaCard';
import { SongCard } from '@/components/UI/SongCard';
import { usePlayerStore, Track } from '@/store/playerStore';
import { QuickPickCard } from '@/components/UI/QuickPickCard';
import './Home.css';

const Home: React.FC = () => {
  const { setQueue } = usePlayerStore();
  const [trendingTracks, setTrendingTracks] = useState<Track[]>([]);
  const [playlists, setPlaylists] = useState<any[]>([]);
  const [artists, setArtists] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        const response = await fetch('/api/home');
        const data = await response.json();
        if (data.tracks) setTrendingTracks(data.tracks);
        if (data.playlists) setPlaylists(data.playlists);
        if (data.artists) setArtists(data.artists);
      } catch (error) {
        console.error('Failed to fetch home data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchHomeData();
  }, []);

  // Use playlists for the Quick Picks
  const quickPicks = playlists.slice(0, 8);

  return (
    <div className="home-page animate-fade-in">
      <div className="home-content-wrapper">
        <div className="home-header-pills">
          <button className="home-filter-pill active">All</button>
          <button className="home-filter-pill">Music</button>
        </div>

        {/* Quick Picks 2x4 Grid */}
        <div className="quick-picks-grid">
          {quickPicks.map((playlist, index) => (
            <QuickPickCard 
              key={playlist.id}
              title={playlist.title}
              imageUrl={playlist.imageUrl}
              onClick={() => setQueue(trendingTracks, index % trendingTracks.length)}
            />
          ))}
          {/* Fill remaining with some mock data if API didn't return 8 */}
          {quickPicks.length < 8 && Array.from({ length: 8 - quickPicks.length }).map((_, i) => (
            <QuickPickCard 
              key={`mock-${i}`}
              title="Liked Songs"
              imageUrl="https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=64&h=64&fit=crop"
              onClick={() => setQueue(trendingTracks, i % trendingTracks.length)}
            />
          ))}
        </div>

        <section className="section">
          <div className="section-header">
            <h2 className="section-title">Getting started</h2>
            <button className="section-more">Show all</button>
          </div>
          
          {isLoading ? (
            <div style={{ padding: '20px', color: 'var(--color-text-secondary)' }}>Loading live data...</div>
          ) : (
            <div className="horizontal-scroll">
              {trendingTracks.slice(0, 6).map((track, index) => (
                <div key={track.id} className="scroll-item" onClick={() => setQueue(trendingTracks, index)}>
                  <MediaCard item={track} />
                </div>
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
            {playlists.map((playlist, index) => (
              <div key={playlist.id} className="scroll-item">
                <MediaCard 
                  item={playlist} 
                  onClick={() => setQueue(trendingTracks, index % trendingTracks.length)} 
                />
              </div>
            ))}
          </div>
        </section>

        <section className="section">
          <div className="section-header">
            <h2 className="section-title">Popular Artists</h2>
            <button className="section-more">Show all</button>
          </div>
          <div className="horizontal-scroll">
            {artists.map((artist, index) => (
              <div key={artist.id} className="scroll-item">
                <MediaCard 
                  item={{...artist, type: 'artist'}} 
                  onClick={() => setQueue(trendingTracks, index % trendingTracks.length)} 
                />
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default Home;
