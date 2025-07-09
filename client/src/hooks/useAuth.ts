import { useState, useEffect } from "react";
import type { User } from "@shared/schema";

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is stored in localStorage
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        console.log('Loaded user from localStorage:', parsedUser);
        // Check if user has required properties
        if (parsedUser && parsedUser.role && parsedUser.username) {
          setUser(parsedUser);
        } else {
          console.log('Invalid user data in localStorage, clearing it');
          localStorage.removeItem('user');
        }
      } catch (error) {
        console.error('Error parsing stored user:', error);
        localStorage.removeItem('user');
      }
    }
    setIsLoading(false);
  }, []);

  const login = (userData: User) => {
    console.log('useAuth.login called with:', userData);
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  return {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout,
    isGestore: user?.role === 'gestore',
    isOperatore: user?.role === 'operatore'
  };
}