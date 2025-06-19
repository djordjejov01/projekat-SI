import axios from 'axios';

const api = axios.create({
  baseURL: 'http://192.168.0.14:7048/api/Players' // update with your full API URL
});

export const getPlayers = async () => {
  const response = await api.get('/');
  return response.data;
};

export const addPlayer = async (player) => {
  const response = await api.post('/', player);
  return response.data;
};

export const updatePlayer = async (id, player) => {
  const response = await api.put(`/${id}`, player);
  return response.data;
};

export const deletePlayer = async (id) => {
  await api.delete(`/${id}`);
};