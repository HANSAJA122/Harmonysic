"use client";

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { SongCard } from '@/components/UI/SongCard';
import { usePlayerStore, Track } from '@/store/playerStore';
import './Search.css';

const BROWSE_CATEGORIES = [
  { id: '1', name: 'Podcasts', color: '#e13300' },
  { id: '2', name: 'Made For You', color: '#1e3264' },
  { id: '3', name: 'Charts', color: '#8d67ab' },
  { id: '4', name: 'New Releases', color: '#e8115b' },
  { id: '5', name: 'Discover', color: '#8c1932' },
  { id: '6', name: 'Concerts', color: '#7358ff' },
];

const SearchContent: React.FC = () => {
  const { setQueue } = usePlayerStore();
  const searchParams = useSearchParams();
  const query = searchParams.get('q') || '';
  
  const [searchResults, setSearchResults] = useState<Track[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    const fetchSearchData = async () => {
      if (!query.trim()) {
        setSearchResults([]);
        setIsSearching(false);
        return;
      }

      setIsSearching(true);
      try {
        const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
        const data = await response.json();
        if (data.tracks) {
          setSearchResults(data.tracks);
        }
      } catch (error) {
        console.error('Search failed:', error);
      } finally {
        setIsSearching(false);
      }
    };

    const debounceTimer = setTimeout(() => {
      fetchSearchData();
    }, 500); // 500ms debounce

    return () => clearTimeout(debounceTimer);
  }, [query]);

  return (
    <div className="search-page animate-fade-in" style={{ paddingTop: '16px' }}>
      {query ? (
        <div className="search-results">
          <h2 className="text-xl font-bold mb-4" style={{ marginBottom: '1rem' }}>Top Results for "{query}"</h2>
          {isSearching ? (
            <p className="text-secondary">Searching YouTube Music...</p>
          ) : searchResults.length > 0 ? (
            <div style={{ display: 'grid', gap: '8px' }}>
              {searchResults.map((track, index) => (
                <SongCard 
                  key={track.id} 
                  track={track} 
                  onClick={() => setQueue(searchResults, index)}
                />
              ))}
            </div>
          ) : (
            <p className="text-secondary">No results found for "{query}"</p>
          )}
        </div>
      ) : (
        <section className="browse-section">
          <h2 className="text-xl font-bold mb-4" style={{ marginBottom: '1rem' }}>Browse all</h2>
          <div className="browse-grid">
            {BROWSE_CATEGORIES.map(category => (
              <div
                key={category.id}
                className="category-card"
                style={{ backgroundColor: category.color }}
              >
                <h3 className="category-title">{category.name}</h3>
                <div className="category-decoration"></div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

const Search: React.FC = () => {
  return (
    <Suspense fallback={<div style={{ padding: '24px' }}>Loading...</div>}>
      <SearchContent />
    </Suspense>
  );
};

export default Search;
