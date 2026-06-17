"use client";

import React, { useState } from 'react';
import { Plus, Search } from 'lucide-react';
import { mockPlaylists, mockArtists } from '@/data/mockData';
import { MediaCard } from '@/components/UI/MediaCard';
import './Library.css';

const Library: React.FC = () => {
  const [activeTab, setActiveTab] = useState('Playlists');
  const tabs = ['Playlists', 'Artists', 'Albums', 'Downloaded'];

  return (
    <div className="library-page animate-fade-in">
      <header className="library-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: 36, height: 36, borderRadius: '50%', backgroundColor: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#000', fontWeight: 'bold' }}>
            H
          </div>
          <h1 className="text-2xl font-bold">Your Library</h1>
        </div>
        <div style={{ display: 'flex', gap: '16px' }}>
          <button className="icon-btn" style={{ background: 'transparent' }}><Search size={24} /></button>
          <button className="icon-btn" style={{ background: 'transparent' }}><Plus size={24} /></button>
        </div>
      </header>

      <div className="library-tabs">
        {tabs.map(tab => (
          <button
            key={tab}
            className={`library-tab ${activeTab === tab ? 'active' : ''}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </button>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '16px' }}>
        {activeTab === 'Playlists' && (
          <>
            {/* Liked Songs Special Card */}
            <div className="media-card" style={{ background: 'linear-gradient(135deg, #450af5, #c4efd9)' }}>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', padding: '16px' }}>
                <h3 className="text-2xl font-bold mb-2">Liked Songs</h3>
                <p className="text-sm">248 songs</p>
              </div>
            </div>
            {mockPlaylists.map(p => <MediaCard key={p.id} item={p} />)}
          </>
        )}
        {activeTab === 'Artists' && mockArtists.map(a => <MediaCard key={a.id} item={a} />)}
        {activeTab === 'Albums' && <div className="text-secondary" style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '40px' }}>No albums saved yet.</div>}
        {activeTab === 'Downloaded' && <div className="text-secondary" style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '40px' }}>No downloaded content.</div>}
      </div>
    </div>
  );
};

export default Library;
