import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../utils/api';

const UserContext = createContext(null);

export function UserProvider({ children }) {
  const navigate = useNavigate();

  // Initialize user from localStorage
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('chaincred_user');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch (error) {
      console.error('Error parsing user from localStorage:', error);
      return null;
    }
  });

  const [loading, setLoading] = useState(true); // Start with loading true
  const [toasts, setToasts] = useState([]);

  // Validate user on mount
  useEffect(() => {
    const validateUser = async () => {
      if (user?.wallet) {
        try {
          const res = await axios.get(`/api/auth/user/${user.wallet.toLowerCase()}`);
          if (res.data?.success && res.data?.data?.user) {
            setUser(res.data.data.user);
          } else {
            setUser(null);
            localStorage.removeItem('chaincred_user');
            navigate('/sign-in');
          }
        } catch (error) {
          console.error('User validation error:', error);
          setUser(null);
          localStorage.removeItem('chaincred_user');
          navigate('/sign-in');
        }
      }
      setLoading(false);
    };
    validateUser();
  }, [navigate]);

  // Sync user with localStorage
  useEffect(() => {
    try {
      if (user) {
        localStorage.setItem('chaincred_user', JSON.stringify(user));
      } else {
        localStorage.removeItem('chaincred_user');
      }
    } catch (error) {
      console.error('Error saving user to localStorage:', error);
    }
  }, [user]);

  // Custom toast system
  const showToast = (type, message) => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  };

  // Logout handler
  const logout = () => {
    try {
      console.log('Logout triggered');
      setUser(null);
      localStorage.removeItem('chaincred_user');
      showToast('success', 'Logged out successfully');
      navigate('/sign-in');
    } catch (error) {
      console.error('Logout error:', error);
      showToast('error', 'Failed to log out');
    }
  };

  return (
    <UserContext.Provider value={{ user, setUser, loading, setLoading, showToast, logout }}>
      {children}
      <div className="fixed bottom-4 right-4 space-y-2 z-50">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`px-4 py-2 rounded-xl shadow-lg text-white transition-all duration-300 transform hover:scale-105
              ${t.type === 'error' ? 'bg-red-600' :
                t.type === 'warning' ? 'bg-yellow-600' :
                t.type === 'info' ? 'bg-blue-600' :
                'bg-green-600'}`}
          >
            {t.message}
          </div>
        ))}
      </div>
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}