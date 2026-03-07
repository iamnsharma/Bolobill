import axios from 'axios';
import {Platform} from 'react-native';
import {STORAGE_KEYS} from '../../../utils/storage/keys';
import {storage} from '../../../utils/storage/mmkv';

const DEV_BASE_URL =
  Platform.OS === 'android'
    ? 'http://10.0.2.2:3011/api'
    : 'http://localhost:3011/api';

export const privateClient = axios.create({
  baseURL: __DEV__ ? DEV_BASE_URL : 'https://api.example.com',
  timeout: 15_000,
});

privateClient.interceptors.request.use(config => {
  const token = storage.getString(STORAGE_KEYS.AUTH_TOKEN);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
