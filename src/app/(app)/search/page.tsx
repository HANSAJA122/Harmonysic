"use client";

import React, { useState, useEffect } from 'react';
import { Search as SearchIcon } from 'lucide-react';
import { mockCategories } from '@/data/mockData';
import { SongCard } from '@/components/UI/SongCard';
import { Track } from '@/store/playerStore';
import './Search.css';

const Search: React.FC = () => {
  const [query, setQuery] = useState('');
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
    <div className="search-page animate-fade-in">
      <header className="search-header">
        <div className="search-input-container">
          <SearchIcon className="search-icon" size={20} />
          <input
            type="text"
            className="search-input"
            placeholder="What do you want to listen to?"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
      </header>

      {query ? (
        <div className="search-results">
          <h2 className="text-xl font-bold mb-4" style={{ marginBottom: '1rem' }}>Top Results</h2>
          {isSearching ? (
            <p className="text-secondary">Searching YouTube Music...</p>
          ) : searchResults.length > 0 ? (
            <div style={{ display: 'grid', gap: '8px' }}>
              {searchResults.map(track => (
                <SongCard key={track.id} track={track} />
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
            {mockCategories.map(category => (
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

export default Search;
