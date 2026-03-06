import axios from 'axios';

export const privateClient = axios.create({
  baseURL: 'https://api.example.com',
  timeout: 15_000,
});
