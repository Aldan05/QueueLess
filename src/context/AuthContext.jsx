import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (currentUser?.preferences?.theme === 'dark' || currentUser?.preferences?.darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [currentUser?.preferences?.theme, currentUser?.preferences?.darkMode]);

  useEffect(() => {
    // Check for existing session
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      setCurrentUser(JSON.parse(storedUser));
      setIsAuthenticated(true);
      window.dispatchEvent(new Event('auth_state_changed'));
    }
    setLoading(false);
  }, []);

  const loginAPI = async (email, password) => {
    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        localStorage.setItem('currentUser', JSON.stringify(data));
        setCurrentUser(data);
        setIsAuthenticated(true);
        window.dispatchEvent(new Event('auth_state_changed'));
        return data;
      } else {
        throw new Error(data.message || 'Login failed');
      }
    } catch (error) {
      throw error;
    }
  };

  const login = (user) => {
    // Fallback for legacy components still using manual user injection
    localStorage.setItem('currentUser', JSON.stringify(user));
    setCurrentUser(user);
    setIsAuthenticated(true);
    window.dispatchEvent(new Event('auth_state_changed'));
  };

  const updateProfile = async (profileData) => {
    try {
      const response = await fetch(`${API_URL}/auth/profile`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: currentUser._id, ...profileData })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        localStorage.setItem('currentUser', JSON.stringify(data));
        setCurrentUser(data);
        window.dispatchEvent(new Event('auth_state_changed'));
        return data;
      } else {
        throw new Error(data.message || 'Failed to update profile');
      }
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('currentUser');
    setCurrentUser(null);
    setIsAuthenticated(false);
    window.dispatchEvent(new Event('auth_state_changed'));
  };

  return (
    <AuthContext.Provider value={{ 
      currentUser, 
      userRole: currentUser?.role || null,
      isAuthenticated, 
      login, 
      loginAPI,
      updateProfile,
      logout, 
      loading 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
