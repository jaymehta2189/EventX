import React, { createContext, useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import axios from 'axios';

// Create the context
export const AuthContext = createContext();

// Create a provider component
export function AuthProvider({ children }) {
  // Initialize state from localStorage if available
  const [authToken, setAuthToken] = useState(localStorage.getItem('token') || null);

  useEffect(() => {
    // If a token exists in localStorage, set axios default header
    if (authToken) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${authToken}`;
    }
  }, [authToken]);

  return (
    <AuthContext.Provider value={{ authToken, setAuthToken }}>
      {children}
    </AuthContext.Provider>
  );
}
