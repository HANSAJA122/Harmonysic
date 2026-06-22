import React, { useRef } from 'react';
import { X, Share, Clock, PlayCircle, Star, Music, Award } from 'lucide-react';
import { toPng } from 'html-to-image';

interface Stats {
  totalLiked: number;
  totalRecentlyPlayed: number;
  topArtists: { name: string; count: number }[];
  topTracks: any[];
  totalMinutes: number;
  month: string;
}

interface MonthlyRecapModalProps {
  stats: Stats;
  onClose: () => void;
}

export default function MonthlyRecapModal({ stats, onClose }: MonthlyRecapModalProps) {
  const recapRef = useRef<HTMLDivElement>(null);

  const handleShare = async () => {
    if (!recapRef.current) return;
    
    try {
      const dataUrl = await toPng(recapRef.current, {
        quality: 1,
        backgroundColor: '#000',
        width: recapRef.current.offsetWidth,
        height: recapRef.current.offsetHeight,
      });

      const link = document.createElement('a');
      link.download = `Harmonysic-Recap-${stats.month}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Failed to generate image', err);
      alert('Failed to generate image. Please try again.');
    }
  };

  const monthNames = ["January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"];
  
  const [yearStr, monthStr] = stats.month.split('-');
  const displayMonth = `${monthNames[parseInt(monthStr) - 1]} ${yearStr}`;

  return (
    <div style={{
      position: 'fixed',
      top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      backdropFilter: 'blur(10px)',
      zIndex: 9999,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <div style={{
        position: 'absolute',
        top: '20px',
        right: '20px',
        display: 'flex',
        gap: '12px'
      }}>
        <button onClick={handleShare} style={{
          background: 'var(--color-primary)',
          color: 'white',
          border: 'none',
          padding: '10px 20px',
          borderRadius: 'var(--radius-full)',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          fontWeight: 'bold',
          boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
        }}>
          <Share size={18} />
          Save to Share
        </button>
        <button onClick={onClose} style={{
          background: 'rgba(255,255,255,0.1)',
          color: 'white',
          border: 'none',
          width: '40px',
          height: '40px',
          borderRadius: '50%',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <X size={24} />
        </button>
      </div>

      <div 
        ref={recapRef}
        style={{
          width: '100%',
          maxWidth: '400px',
          aspectRatio: '9/16',
          background: 'linear-gradient(145deg, #120a2e 0%, #2a0845 50%, #6441A5 100%)',
          borderRadius: '24px',
          padding: '40px 30px',
          display: 'flex',
          flexDirection: 'column',
          color: 'white',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        {/* Background decorations */}
        <div style={{ position: 'absolute', top: '-10%', left: '-10%', width: '200px', height: '200px', background: 'rgba(255,255,255,0.05)', borderRadius: '50%', filter: 'blur(40px)' }} />
        <div style={{ position: 'absolute', bottom: '-10%', right: '-10%', width: '250px', height: '250px', background: 'var(--color-primary)', opacity: '0.2', borderRadius: '50%', filter: 'blur(50px)' }} />

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '40px', zIndex: 1 }}>
          <div style={{ fontSize: '14px', letterSpacing: '2px', textTransform: 'uppercase', opacity: 0.8, marginBottom: '8px', fontWeight: '600' }}>
            Harmonysic Recap
          </div>
          <h1 style={{ fontSize: '36px', fontWeight: '900', margin: 0, background: 'linear-gradient(to right, #fff, rgba(255,255,255,0.7))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            {displayMonth}
          </h1>
        </div>

        {/* Top Artist */}
        {stats.topArtists.length > 0 && (
          <div style={{ textAlign: 'center', marginBottom: '40px', zIndex: 1 }}>
            <p style={{ margin: '0 0 10px 0', fontSize: '16px', opacity: 0.9 }}>Your Top Artist</p>
            <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.1)', padding: '16px 32px', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.2)' }}>
              <Star size={24} style={{ color: '#fbbf24', marginRight: '12px' }} />
              <h2 style={{ fontSize: '28px', fontWeight: 'bold', margin: 0 }}>{stats.topArtists[0].name}</h2>
            </div>
          </div>
        )}

        {/* Stats Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '40px', zIndex: 1 }}>
          <div style={{ background: 'rgba(0,0,0,0.3)', padding: '20px', borderRadius: '16px', textAlign: 'center', border: '1px solid rgba(255,255,255,0.05)' }}>
            <Clock size={28} style={{ margin: '0 auto 12px', color: '#4ade80' }} />
            <div style={{ fontSize: '32px', fontWeight: '900', marginBottom: '4px' }}>{stats.totalMinutes}</div>
            <div style={{ fontSize: '12px', opacity: 0.7, textTransform: 'uppercase', letterSpacing: '1px' }}>Minutes</div>
          </div>
          <div style={{ background: 'rgba(0,0,0,0.3)', padding: '20px', borderRadius: '16px', textAlign: 'center', border: '1px solid rgba(255,255,255,0.05)' }}>
            <PlayCircle size={28} style={{ margin: '0 auto 12px', color: '#60a5fa' }} />
            <div style={{ fontSize: '32px', fontWeight: '900', marginBottom: '4px' }}>{stats.totalRecentlyPlayed}</div>
            <div style={{ fontSize: '12px', opacity: 0.7, textTransform: 'uppercase', letterSpacing: '1px' }}>Tracks</div>
          </div>
        </div>

        {/* Top Track */}
        {stats.topTracks.length > 0 && (
          <div style={{ marginTop: 'auto', background: 'rgba(255,255,255,0.05)', padding: '20px', borderRadius: '16px', zIndex: 1, backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.1)' }}>
            <p style={{ margin: '0 0 12px 0', fontSize: '14px', opacity: 0.9, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Award size={16} color="#fbbf24" /> Top Song
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <img src={stats.topTracks[0].albumUrl} alt="Album" style={{ width: '60px', height: '60px', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.3)' }} />
              <div>
                <div style={{ fontWeight: 'bold', fontSize: '18px', marginBottom: '4px' }}>{stats.topTracks[0].title}</div>
                <div style={{ opacity: 0.7, fontSize: '14px' }}>{stats.topTracks[0].artist}</div>
              </div>
            </div>
          </div>
        )}

        {/* Footer brand */}
        <div style={{ textAlign: 'center', marginTop: 'auto', opacity: 0.5, fontSize: '12px', letterSpacing: '2px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', zIndex: 1, marginTop: '24px' }}>
          <Music size={14} /> HARMONYSIC
        </div>
      </div>
    </div>
  );
}
