import React, { createContext, useContext, useState } from 'react';

type FavoriteContextType = {
  favorites: string[];
  toggleFavorite: (id: string) => void;
};

const FavoritesContext = createContext<FavoriteContextType>({
  favorites: [],
  toggleFavorite: () => {},
});

export const useFavorites = () => useContext(FavoritesContext);

export const FavoritesProvider = ({ children }: { children: React.ReactNode }) => {
  const [favorites, setFavorites] = useState<string[]>([]);

  const toggleFavorite = (id: string) => {
    setFavorites((prev) =>
      prev.includes(id) ? prev.filter((favId) => favId !== id) : [...prev, id]
    );
  };

  return (
    <FavoritesContext.Provider value={{ favorites, toggleFavorite }}>
      {children}
    </FavoritesContext.Provider>
  );
};
