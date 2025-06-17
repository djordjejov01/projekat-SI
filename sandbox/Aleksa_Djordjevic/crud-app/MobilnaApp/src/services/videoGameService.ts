import axios from 'axios';
import { VideoGame } from '../types/VideoGame';

const API_URL = 'http://localhost:5222/api/VideoGames';

export const getAllGames = () => axios.get<VideoGame[]>(API_URL);
export const getById = (id: number) => axios.get<VideoGame>(`${API_URL}/${id}`);
export const addGame = (game: VideoGame) => axios.post(API_URL, game);
export const updateGame = (game: VideoGame) => axios.put(`${API_URL}/${game.id}`, game);
export const deleteGame = (id: number) => axios.delete(`${API_URL}/${id}`);