"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Bell, Clock, Settings } from 'lucide-react';
import { MediaCard } from '@/components/UI/MediaCard';
import { SongCard } from '@/components/UI/SongCard';
import { usePlayerStore, Track } from '@/store/playerStore';
import { QuickPickCard } from '@/components/UI/QuickPickCard';
import './Home.css';

const Home: React.FC = () => {
  const router = useRouter();
  const { setQueue, recentlyPlayed } = usePlayerStore();
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
              onClick={() => router.push(`/playlist/${playlist.id}`)}
            />
          ))}
        </div>

        {recentlyPlayed && recentlyPlayed.length > 0 && (
          <section className="section">
            <div className="section-header">
              <h2 className="section-title">Recently Played</h2>
              <button className="section-more">Show all</button>
            </div>
            <div className="horizontal-scroll">
              {recentlyPlayed.map((track, index) => (
                <div key={`${track.id}-${index}`} className="scroll-item" onClick={() => setQueue(recentlyPlayed, index)}>
                  <MediaCard 
                    item={{
                      id: track.id,
                      title: track.title,
                      subtitle: track.artist,
                      imageUrl: track.albumUrl,
                      type: 'album'
                    }} 
                  />
                </div>
              ))}
            </div>
          </section>
        )}

        <section className="section">
          <div className="section-header">
            <h2 className="section-title">Trending Music Globally</h2>
            <button className="section-more">Show all</button>
          </div>
          
          {isLoading ? (
            <div style={{ padding: '20px', color: 'var(--color-text-secondary)' }}>Loading live data...</div>
          ) : (
            <div className="horizontal-scroll">
              {trendingTracks.slice(0, 6).map((track, index) => (
                <div key={track.id} className="scroll-item" onClick={() => setQueue(trendingTracks, index)}>
                  <MediaCard 
                    item={{
                      id: track.id,
                      title: track.title,
                      subtitle: track.artist,
                      imageUrl: track.albumUrl,
                      type: 'album'
                    }} 
                  />
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
                  onClick={() => router.push(`/playlist/${playlist.id}`)} 
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
                  onClick={() => router.push(`/artist/${artist.id}`)} 
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
