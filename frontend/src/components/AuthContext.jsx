import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [authToken, setAuthToken] = useState(() => {
    // Check for token in both localStorage and cookies on initial load
    const localToken = localStorage.getItem('token');
    const cookieToken = Cookies.get('token');
    
    if (cookieToken) {
      // If token exists in cookie, store it in localStorage but keep the cookie
      localStorage.setItem('token', cookieToken);
      return cookieToken;
    }
    
    // If token exists in localStorage, set it in cookie as well
    if (localToken) {
      Cookies.set('token', localToken, { path: '/' });
    }
    
    return localToken || null;
  });

  useEffect(() => {
    if (authToken) {
      // Set axios default header when token changes
      axios.defaults.headers.common['Authorization'] = `Bearer ${authToken}`;
      // Ensure token is in both localStorage and cookie
      localStorage.setItem('token', authToken);
      Cookies.set('token', authToken, { path: '/' });
    } else {
      // Clear axios header, localStorage, and cookie when token is null
      delete axios.defaults.headers.common['Authorization'];
      localStorage.removeItem('token');
      Cookies.remove('token');
    }
  }, [authToken]);

  const logout = () => {
    setAuthToken(null);
    localStorage.removeItem('token');
    Cookies.remove('token');
    delete axios.defaults.headers.common['Authorization'];
  };

  return (
    <AuthContext.Provider value={{ authToken, setAuthToken, logout }}>
      {children}
    </AuthContext.Provider>
  );
}