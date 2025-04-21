import React, { createContext, useState, useEffect } from 'react';
import { API_URL } from '../config';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState('');
  
  // Sayfa yüklendiğinde localStorage'dan kullanıcı bilgilerini al
  useEffect(() => {
    const user = localStorage.getItem('user');
    if (user) {
      setCurrentUser(JSON.parse(user));
    }
    setLoading(false);
  }, []);
  
  // Giriş işlemi
  const login = async (email, password) => {
    setAuthError('');
    try {
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Giriş başarısız');
      }
      
      // Kullanıcı bilgilerini state ve localStorage'a kaydet
      setCurrentUser(data);
      localStorage.setItem('user', JSON.stringify(data));
      return data;
    } catch (error) {
      setAuthError(error.message);
      throw error;
    }
  };
  
  // Kayıt işlemi
  const register = async (name, email, password, phone) => {
    setAuthError('');
    try {
      const response = await fetch(`${API_URL}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, password, phone }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Kayıt başarısız');
      }
      
      // Kullanıcı bilgilerini state ve localStorage'a kaydet
      setCurrentUser(data);
      localStorage.setItem('user', JSON.stringify(data));
      return data;
    } catch (error) {
      setAuthError(error.message);
      throw error;
    }
  };
  
  // Çıkış işlemi
  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('user');
  };
  
  // API istekleri için token ekleyen fonksiyon
  const authFetch = async (url, options = {}) => {
    if (!currentUser || !currentUser.accessToken) {
      throw new Error('User is not logged in');
    }
    
    // URL tam URL değilse, API_URL ile birleştir
    const fullUrl = url.startsWith('http') ? url : `${API_URL}${url}`;
    
    const headers = {
      ...options.headers || {},
      'Authorization': `Bearer ${currentUser.accessToken}`,
    };
    
    return fetch(fullUrl, {
      ...options,
      headers,
    });
  };
  
  const value = {
    currentUser,
    loading,
    authError,
    login,
    register,
    logout,
    authFetch
  };
  
  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
