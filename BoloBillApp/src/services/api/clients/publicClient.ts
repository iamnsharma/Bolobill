import axios from 'axios';

export const publicClient = axios.create({
  baseURL: 'https://api.example.com',
  timeout: 15_000,
});
