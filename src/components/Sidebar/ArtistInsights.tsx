import React from 'react';
import { Lightbulb, Ticket, ExternalLink, CalendarDays } from 'lucide-react';
import { useArtistTrivia } from '@/hooks/useArtistTrivia';
import './ArtistInsights.css';

interface ArtistInsightsProps {
  artistName: string;
}

export const ArtistInsights: React.FC<ArtistInsightsProps> = ({ artistName }) => {
  const { extract, loading, error } = useArtistTrivia(artistName);

  if (!artistName) return null;

  return (
    <div className="artist-insights-container animate-fade-in">
      
      {/* Trivia Card */}
      <div className="insight-card">
        <div className="insight-header">
          <Lightbulb size={18} />
          <span>Did You Know?</span>
        </div>
        
        {loading && <div className="insight-shimmer"></div>}
        
        {!loading && extract && (
          <div className="insight-content">
            {extract}
          </div>
        )}

        {!loading && error && (
          <div className="insight-content opacity-50">
            Learn more about {artistName} by exploring their music.
          </div>
        )}
      </div>

      {/* Concert / Tour Card */}
      <div className="insight-card">
        <div className="insight-header">
          <CalendarDays size={18} />
          <span>On Tour</span>
        </div>
        <div className="insight-content">
          Catch <strong>{artistName}</strong> live in concert. Check for upcoming dates and secure your tickets.
          
          <a 
            href={`https://www.ticketmaster.com/search?q=${encodeURIComponent(artistName)}`} 
            target="_blank" 
            rel="noopener noreferrer"
            className="ticket-btn"
          >
            <Ticket size={16} />
            Ticketmaster
            <ExternalLink size={14} style={{ marginLeft: 'auto' }} />
          </a>

          <a 
            href={`https://seatgeek.com/search?search=${encodeURIComponent(artistName)}`} 
            target="_blank" 
            rel="noopener noreferrer"
            className="ticket-btn seatgeek"
          >
            <Ticket size={16} />
            SeatGeek
            <ExternalLink size={14} style={{ marginLeft: 'auto' }} />
          </a>
        </div>
      </div>
      
    </div>
  );
};
