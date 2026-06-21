"use client";

import React, { useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useAuthStore } from '@/store/authStore';
import { LoginModal } from './LoginModal';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { initAuthListener } = useAuthStore();

  useEffect(() => {
    const unsubscribe = initAuthListener();
    return () => unsubscribe();
  }, [initAuthListener]);

  return (
    <>
      {children}
      <LoginModal />
    </>
  );
};
