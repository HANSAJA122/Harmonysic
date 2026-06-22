"use client";

import React from 'react';
import { usePlayerStore } from '@/store/playerStore';
import './LiquidAura.css';

export const LiquidAura: React.FC = () => {
  const { theme } = usePlayerStore();

  return (
    <div className={`liquid-aura-container ${theme}`}>
      <div className="aura-orb orb-1"></div>
      <div className="aura-orb orb-2"></div>
      <div className="aura-orb orb-3"></div>
      <div className="aura-overlay"></div>
    </div>
  );
};
