import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

const BetaAuthContext = createContext();

export const useBetaAuth = () => {
  const context = useContext(BetaAuthContext);
  if (!context) {
    throw new Error('useBetaAuth must be used within a BetaAuthProvider');
  }
  return context;
};

export const BetaAuthProvider = ({ children }) => {
  const { user } = useAuth();
  const [userRole, setUserRole] = useState(null);
  const [hasAccess, setHasAccess] = useState(false);
  const [loading, setLoading] = useState(true);

  // Define authorized beta users and their roles
  const authorizedUsers = {
    // Admin users (full access)
    'admin@onesource-ai.com': 'admin',
    'developer@onesource-ai.com': 'admin',
    'support@onesource-ai.com': 'admin',
    
    // Beta testers (limited access)
    'beta.tester@example.com': 'beta_tester',
    'architect.test@gmail.com': 'beta_tester',
    'engineer.test@outlook.com': 'beta_tester',
    'surveyor.test@yahoo.com': 'beta_tester',
    
    // Demo account for testing
    'demo.user@gmail.com': 'beta_tester'
  };

  // Role permissions
  const rolePermissions = {
    admin: {
      canAccessAdmin: true,
      canManageUsers: true,
      canViewAnalytics: true,
      canModifySettings: true,
      canAccessAllFeatures: true,
      questionLimit: null // unlimited
    },
    beta_tester: {
      canAccessAdmin: false,
      canManageUsers: false,
      canViewAnalytics: false,
      canModifySettings: false,
      canAccessAllFeatures: true,
      questionLimit: 10 // higher limit for testing
    }
  };

  useEffect(() => {
    const checkUserAccess = () => {
      setLoading(true);
      
      // PRODUCTION: Allow access to all authenticated users
      if (user?.email) {
        // Check for admin privileges
        const email = user.email.toLowerCase();
        const isAdmin = email.includes('admin') || email.includes('dev') || 
                       email === 'support@onesource-ai.com' || 
                       email === 'admin@onesource-ai.com';
        
        setUserRole(isAdmin ? 'admin' : 'user');
        setHasAccess(true);
      } else {
        setUserRole(null);
        setHasAccess(false);
      }
      
      setLoading(false);
    };

    checkUserAccess();
  }, [user]);

  const getPermissions = () => {
    if (!userRole) return null;
    return rolePermissions[userRole] || null;
  };

  const canAccess = (feature) => {
    const permissions = getPermissions();
    if (!permissions) return false;
    
    switch (feature) {
      case 'admin':
        return permissions.canAccessAdmin;
      case 'analytics':
        return permissions.canViewAnalytics;
      case 'settings':
        return permissions.canModifySettings;
      case 'user_management':
        return permissions.canManageUsers;
      default:
        return permissions.canAccessAllFeatures;
    }
  };

  const getQuestionLimit = () => {
    const permissions = getPermissions();
    return permissions?.questionLimit || 3; // Default to 3 if no permissions
  };

  const isAdmin = () => userRole === 'admin';
  const isBetaTester = () => userRole === 'beta_tester';

  const value = {
    userRole,
    hasAccess,
    loading,
    canAccess,
    getPermissions,
    getQuestionLimit,
    isAdmin,
    isBetaTester,
    authorizedUsers: Object.keys(authorizedUsers)
  };

  return (
    <BetaAuthContext.Provider value={value}>
      {children}
    </BetaAuthContext.Provider>
  );
};

export default BetaAuthContext;