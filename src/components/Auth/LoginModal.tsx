import React from 'react';
import { signInWithPopup } from 'firebase/auth';
import { auth, googleProvider } from '@/lib/firebase';
import { useAuthStore } from '@/store/authStore';
import { X } from 'lucide-react';
import './LoginModal.css';

export const LoginModal: React.FC = () => {
  const { isLoginModalOpen, closeLoginModal } = useAuthStore();

  if (!isLoginModalOpen) return null;

  const handleGoogleSignIn = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
      closeLoginModal();
    } catch (error) {
      console.error('Google Sign In Error:', error);
      alert('Failed to sign in with Google');
    }
  };

  return (
    <div className="modal-overlay" onClick={closeLoginModal}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close-btn" onClick={closeLoginModal}>
          <X size={24} />
        </button>
        
        <div className="modal-header">
          <div className="modal-logo">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 18V5l12-2v13"></path>
              <circle cx="6" cy="18" r="3"></circle>
              <circle cx="18" cy="16" r="3"></circle>
            </svg>
          </div>
          <h2>Log in to Harmonysic</h2>
        </div>

        <div className="modal-body">
          <button className="auth-btn google-btn" onClick={handleGoogleSignIn}>
            <img src="https://upload.wikimedia.org/wikipedia/commons/5/53/Google_%22G%22_Logo.svg" alt="Google" />
            Continue with Google
          </button>
          
          <div className="divider">
            <span>or</span>
          </div>
          
          <p className="auth-disclaimer">
            By continuing, you agree to Harmonysic's Terms of Service and Privacy Policy.
          </p>
        </div>
      </div>
    </div>
  );
};
