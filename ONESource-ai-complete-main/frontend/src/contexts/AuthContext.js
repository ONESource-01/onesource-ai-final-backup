import React, { createContext, useContext, useEffect, useState } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false); // Start as false for demo
  const [idToken, setIdToken] = useState(null);

  // Mock authentication for demo purposes
  useEffect(() => {
    // Check if user was previously "logged in" via localStorage
    const mockUser = localStorage.getItem('demo_user');
    if (mockUser) {
      const userData = JSON.parse(mockUser);
      setUser(userData);
      setIdToken('mock_demo_token_' + userData.uid);
    }
  }, []);

  // Sign up with email and password (MOCK)
  const signUp = async (email, password) => {
    try {
      // Simulate processing time
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockUser = {
        uid: 'demo_user_' + Date.now(),
        email: email,
        displayName: email.split('@')[0],
        emailVerified: true
      };
      
      setUser(mockUser);
      setIdToken('mock_demo_token_' + mockUser.uid);
      localStorage.setItem('demo_user', JSON.stringify(mockUser));
      
      return { user: mockUser, error: null };
    } catch (error) {
      return { user: null, error: 'Demo sign-up failed' };
    }
  };

  // Sign in with email and password (MOCK)
  const signIn = async (email, password) => {
    try {
      // Simulate processing time
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockUser = {
        uid: 'demo_user_' + Date.now(),
        email: email,
        displayName: email.split('@')[0],
        emailVerified: true
      };
      
      setUser(mockUser);
      setIdToken('mock_demo_token_' + mockUser.uid);
      localStorage.setItem('demo_user', JSON.stringify(mockUser));
      
      return { user: mockUser, error: null };
    } catch (error) {
      return { user: null, error: 'Demo sign-in failed' };
    }
  };

  // Sign in with Google (MOCK)
  const signInWithGoogle = async () => {
    try {
      // Simulate processing time
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const mockUser = {
        uid: 'demo_google_user_' + Date.now(),
        email: 'demo.user@gmail.com',
        displayName: 'Demo Google User',
        emailVerified: true,
        photoURL: 'https://via.placeholder.com/150'
      };
      
      setUser(mockUser);
      setIdToken('mock_demo_token_' + mockUser.uid);
      localStorage.setItem('demo_user', JSON.stringify(mockUser));
      
      return { user: mockUser, error: null };
    } catch (error) {
      return { user: null, error: 'Demo Google sign-in failed' };
    }
  };

  // Sign out (MOCK)
  const logout = async () => {
    try {
      setUser(null);
      setIdToken(null);
      localStorage.removeItem('demo_user');
      return { error: null };
    } catch (error) {
      return { error: 'Demo logout failed' };
    }
  };

  // Reset password (MOCK)
  const resetPassword = async (email) => {
    try {
      // Simulate processing time
      await new Promise(resolve => setTimeout(resolve, 1000));
      return { error: null };
    } catch (error) {
      return { error: 'Demo password reset failed' };
    }
  };

  // Get fresh token (MOCK)
  const getIdToken = async (forceRefresh = false) => {
    if (user) {
      const token = 'mock_demo_token_' + user.uid;
      setIdToken(token);
      return token;
    }
    return null;
  };

  const value = {
    user,
    idToken,
    loading,
    signUp,
    signIn,
    signInWithGoogle,
    logout,
    resetPassword,
    getIdToken
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};