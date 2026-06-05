import React, { createContext, useContext, useState, useEffect } from 'react';
import { getMe } from '../api/auth';
const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);


  useEffect(() => {
    const savedUser = localStorage.getItem('trackcash_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

 
  const login = (email, password) => {
    // Mock user profile payload object
    const user = getMe().then(res => res.data.data.user);
    console.log('Mock login successful, user profile:', user);
    
    setUser(user);
    localStorage.setItem('trackcash_user', JSON.stringify(user));
  };

  // Sign out handler
  const logout = () => {
    setUser(null);
    localStorage.removeItem('trackcash_user');
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// 2. Custom hook shortcut to tap into auth values quickly from any component
export function useAuth() {
  return useContext(AuthContext);
}
