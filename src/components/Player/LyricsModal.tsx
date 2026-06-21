"use client";
import React, { useEffect, useState } from 'react';
import { usePlayerStore } from '@/store/playerStore';
import { X } from 'lucide-react';
import './LyricsModal.css';

interface LyricsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const LyricsModal: React.FC<LyricsModalProps> = ({ isOpen, onClose }) => {
  const { currentTrack } = usePlayerStore();
  const [lyrics, setLyrics] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && currentTrack) {
      setLoading(true);
      setLyrics(null);
      // Fetch lyrics from our new API
      fetch(`/api/lyrics?artist=${encodeURIComponent(currentTrack.artist)}&title=${encodeURIComponent(currentTrack.title)}`)
        .then(res => res.json())
        .then(data => {
          setLyrics(data.lyrics || "We couldn't find lyrics for this song.");
          setLoading(false);
        })
        .catch(err => {
          console.error(err);
          setLyrics("We couldn't load the lyrics right now.");
          setLoading(false);
        });
    }
  }, [isOpen, currentTrack]);

  if (!isOpen) return null;

  return (
    <div className="lyrics-modal-overlay animate-fade-in" onClick={onClose}>
      <div className="lyrics-modal-content" onClick={e => e.stopPropagation()}>
        <button className="lyrics-close-btn" onClick={onClose}>
          <X size={24} />
        </button>
        
        <div className="lyrics-header">
          <img src={currentTrack?.albumUrl} alt="Album" className="lyrics-artwork" />
          <div className="lyrics-info">
            <h2>{currentTrack?.title}</h2>
            <p>{currentTrack?.artist}</p>
          </div>
        </div>

        <div className="lyrics-text-container">
          {loading ? (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : (
            <div className="lyrics-text">
              {lyrics?.split('\\n').map((line, i) => (
                <React.Fragment key={i}>
                  {line}
                  <br />
                </React.Fragment>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LyricsModal;
