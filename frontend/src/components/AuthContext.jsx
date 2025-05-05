

import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [authToken, setAuthToken] = useState(() => {
    const localToken = localStorage.getItem('token');
    const cookieToken = Cookies.get('token');
    
    if (cookieToken) {
      localStorage.setItem('token', cookieToken);
      return cookieToken;
    }
    
    if (localToken) {
      Cookies.set('token', localToken, { 
        path: '/',
        secure: true,
        sameSite: 'None'
      });
    }
    
    return localToken || null;
  });

  useEffect(() => {
    if (authToken) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${authToken}`;
      localStorage.setItem('token', authToken);
      Cookies.set('token', authToken, { 
        path: '/',
        secure: true,
        sameSite: 'None'
      });
    } else {
      delete axios.defaults.headers.common['Authorization'];
      localStorage.removeItem('token');
      Cookies.remove('token', { 
        path: '/',
        secure: true,
        sameSite: 'None'
      });
    }
  }, [authToken]);

  const logout = () => {
    setAuthToken(null);
    localStorage.removeItem('token');
    Cookies.remove('token', { 
      path: '/',
      secure: true,
      sameSite: 'None'
    });
    delete axios.defaults.headers.common['Authorization'];
  };

  return (
    <AuthContext.Provider value={{ authToken, setAuthToken, logout }}>
      {children}
    </AuthContext.Provider>
  );
}