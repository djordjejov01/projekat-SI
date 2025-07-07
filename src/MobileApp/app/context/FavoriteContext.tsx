import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

type FavoriteContextType = {
  favorites: number[];
  toggleFavorite: (eventId: number) => Promise<void>;
  loadFavorites: () => Promise<void>;
  clearFavorites: () => void; // ✅ dodat tip
};

const FavoriteContext = createContext<FavoriteContextType>({
  favorites: [],
  toggleFavorite: async () => {},
  loadFavorites: async () => {},
  clearFavorites: () => {}, // ✅ dodat default
});

export const FavoriteProvider = ({ children }: { children: React.ReactNode }) => {
  const [favorites, setFavorites] = useState<number[]>([]);

  const clearFavorites = () => {
    setFavorites([]);
  };

  const loadFavorites = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) return;

      const response = await fetch('http://192.168.188.32:5216/api/favorites', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        const favoriteIds = data.map((event: any) => event.id);
        setFavorites(favoriteIds);
      }
    } catch (err) {
      console.error('Failed to load favorites:', err);
    }
  };

  const toggleFavorite = async (eventId: number) => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) return;

      const isAlreadyFavorite = favorites.includes(eventId);
      const method = isAlreadyFavorite ? 'DELETE' : 'POST';

      const res = await fetch('http://192.168.188.32:5216/api/Favorites', {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(eventId),
      });

      if (res.ok) {
        await loadFavorites();
      } else {
        console.error('Failed to toggle favorite:', await res.text());
      }
    } catch (err) {
      console.error('Error toggling favorite:', err);
    }
  };

  useEffect(() => {
    loadFavorites();
  }, []);

  return (
    <FavoriteContext.Provider value={{ favorites, toggleFavorite, loadFavorites, clearFavorites }}>
      {children}
    </FavoriteContext.Provider>
  );
};

export const useFavorites = () => useContext(FavoriteContext);
