'use client';

import React, { useState, useEffect, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Search as SearchIcon, X, Play } from 'lucide-react';
import { SkeletonTrack } from '@/components/UI/Skeleton';
import { MediaCard } from '@/components/UI/MediaCard';
import { SongCard } from '@/components/UI/SongCard';
import { usePlayerStore, Track } from '@/store/playerStore';
import './Search.css';

interface SearchResults {
  songs: Track[];
  artists: any[];
  albums: any[];
  playlists: any[];
}

function SearchContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const query = searchParams.get('q') || '';
  
  const { setQueue } = usePlayerStore();
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [results, setResults] = useState<SearchResults | null>(null);
  const [loading, setLoading] = useState(false);

  // Debounce the search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, 500);
    return () => clearTimeout(timer);
  }, [query]);

  // Fetch search results
  useEffect(() => {
    const fetchResults = async () => {
      if (!debouncedQuery.trim()) {
        setResults(null);
        return;
      }
      
      setLoading(true);
      try {
        const response = await fetch(`/api/search?q=${encodeURIComponent(debouncedQuery)}`);
        if (response.ok) {
          const data = await response.json();
          setResults(data);
        }
      } catch (error) {
        console.error('Search failed:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [debouncedQuery]);



  const hasResults = results && (
    results.songs.length > 0 || 
    results.artists.length > 0 || 
    results.albums.length > 0 || 
    results.playlists.length > 0
  );

  return (
    <div className="search-page animate-fade-in">

      <div className="search-content">
        {!query && !loading && (
          <div className="search-empty-state">
            <h2 className="search-empty-title">Search Harmonysic</h2>
            <p className="search-empty-subtitle">Find your favorite songs, artists, albums, and playlists.</p>
          </div>
        )}

        {loading && (
          <div className="search-results">
            <div className="search-top-section">
              <div className="search-top-artist">
                <div style={{ height: 250, width: '100%', background: 'rgba(255,255,255,0.05)', borderRadius: 8 }} className="skeleton-pulse"></div>
              </div>
              <div className="search-top-songs">
                <div className="search-songs-list">
                  <SkeletonTrack />
                  <SkeletonTrack />
                  <SkeletonTrack />
                  <SkeletonTrack />
                </div>
              </div>
            </div>
          </div>
        )}

        {!loading && query && !hasResults && results && (
          <div className="search-empty-state">
            <h2 className="search-empty-title">No results found for "{query}"</h2>
            <p className="search-empty-subtitle">Please make sure your words are spelled correctly or use less or different keywords.</p>
          </div>
        )}

        {!loading && hasResults && (
          <div className="search-results">
            
            {/* Top Results Section - Mix of Songs & Artist */}
            <div className="search-top-section">
              {results.artists.length > 0 && (
                <div className="search-top-artist">
                  <h2 className="search-section-title">Top result</h2>
                  <div 
                    className="top-result-card" 
                    onClick={() => router.push(`/artist/${results.artists[0].id}`)}
                  >
                    <img src={results.artists[0].imageUrl} alt={results.artists[0].title} className="top-result-img" />
                    <h3 className="top-result-title">{results.artists[0].title}</h3>
                    <div className="top-result-type">
                      <span className="type-badge">Artist</span>
                    </div>
                  </div>
                </div>
              )}

              {results.songs.length > 0 && (
                <div className="search-top-songs">
                  <h2 className="search-section-title">Songs</h2>
                  <div className="search-songs-list">
                    {results.songs.slice(0, 4).map((song, index) => (
                      <SongCard 
                        key={song.id} 
                        track={song} 
                        index={index} 
                        onClick={() => setQueue(results.songs, index)} 
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Artists */}
            {results.artists.length > 1 && (
              <section className="search-section">
                <h2 className="search-section-title">Artists</h2>
                <div className="horizontal-scroll">
                  {results.artists.slice(1).map(artist => (
                    <div key={artist.id} className="scroll-item">
                      <MediaCard item={artist} onClick={() => router.push(`/artist/${artist.id}`)} />
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Albums */}
            {results.albums.length > 0 && (
              <section className="search-section">
                <h2 className="search-section-title">Albums</h2>
                <div className="horizontal-scroll">
                  {results.albums.map(album => (
                    <div key={album.id} className="scroll-item">
                      <MediaCard item={album} onClick={() => router.push(`/playlist/${album.id}`)} />
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Playlists */}
            {results.playlists.length > 0 && (
              <section className="search-section">
                <h2 className="search-section-title">Playlists</h2>
                <div className="horizontal-scroll">
                  {results.playlists.map(playlist => (
                    <div key={playlist.id} className="scroll-item">
                      <MediaCard item={playlist} onClick={() => router.push(`/playlist/${playlist.id}`)} />
                    </div>
                  ))}
                </div>
              </section>
            )}
            
          </div>
        )}
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="flex justify-center items-center py-20"><div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary"></div></div>}>
      <SearchContent />
    </Suspense>
  );
}
