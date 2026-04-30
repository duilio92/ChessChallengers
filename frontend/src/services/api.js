import axios from 'axios';

const api = axios.create({
  baseURL: '/api/v1',
  headers: {
    'Content-Type': 'application/json'
  }
});

export const fetchRandomPuzzle = async () => {
  const response = await api.get('/puzzles/random');
  return response.data;
};

export const fetchPuzzleById = async (id) => {
  const response = await api.get(`/puzzles/${id}`);
  return response.data;
};
