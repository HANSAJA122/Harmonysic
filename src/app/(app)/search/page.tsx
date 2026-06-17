"use client";

import React, { useState } from 'react';
import { Search as SearchIcon } from 'lucide-react';
import { mockCategories, mockTracks } from '@/data/mockData';
import { SongCard } from '@/components/UI/SongCard';
import './Search.css';

const Search: React.FC = () => {
  const [query, setQuery] = useState('');

  const filteredTracks = query
    ? mockTracks.filter(t => t.title.toLowerCase().includes(query.toLowerCase()) || t.artist.toLowerCase().includes(query.toLowerCase()))
    : [];

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
          {filteredTracks.length > 0 ? (
            <div style={{ display: 'grid', gap: '8px' }}>
              {filteredTracks.map(track => (
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
