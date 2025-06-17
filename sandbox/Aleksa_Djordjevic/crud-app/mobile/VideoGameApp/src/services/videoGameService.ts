import axios from 'axios';
import { Platform } from "react-native"

const API_URL = 'http://192.168.0.11:5222/api/VideoGames' 
// const API_URL = Platform.OS == "web" ? "http://localhost:5222/api/VideoGames" : "http://192.168.0.11:5222/api/VideoGames"

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
