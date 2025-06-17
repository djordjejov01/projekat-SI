import axios from 'axios';

const API_URL = 'http://localhost:5222/api/VideoGames'; // prilagodi URL tvom backend-u

export interface VideoGame {
  id?: number;
  naziv: string;
  opis: string;
  godina: number | null;
}



export const getAll = () => axios.get<VideoGame[]>(API_URL);
export const getById = (id: number) => axios.get<VideoGame>(`${API_URL}/${id}`);
export const addGame = (game: VideoGame) => axios.post(API_URL, game);
export const updateGame = (game: VideoGame) => axios.put(`${API_URL}/${game.id}`, game);
export const deleteGame = (id: number) => axios.delete(`${API_URL}/${id}`);
