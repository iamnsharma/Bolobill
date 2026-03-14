import axios, {AxiosError} from 'axios';
import {Platform} from 'react-native';
import {STORAGE_KEYS} from '../../../utils/storage/keys';
import {storage} from '../../../utils/storage/mmkv';
import {logApiError, logApiRequest, logApiResponse} from '../logger';

const DEFAULT_DEV_BASE_URL = 'https://api.useaifast.com/api';

const runtimeBaseUrl = storage.getString(STORAGE_KEYS.API_BASE_URL)?.trim();
const DEV_BASE_URL = runtimeBaseUrl || DEFAULT_DEV_BASE_URL;

export const privateClient = axios.create({
  baseURL: __DEV__ ? DEV_BASE_URL : 'https://api.example.com',
  timeout: 15_000,
});

privateClient.interceptors.request.use(config => {
  (config as {metadata?: {startTime: number}}).metadata = {startTime: Date.now()};
  const token = storage.getString(STORAGE_KEYS.AUTH_TOKEN);
  const userRaw = storage.getString(STORAGE_KEYS.AUTH_USER);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  if (userRaw) {
    try {
      const user = JSON.parse(userRaw) as {id?: string};
      if (user.id) {
        config.headers['x-user-id'] = user.id;
      }
    } catch (_error) {
      // Ignore malformed stored user payload.
    }
  }
  logApiRequest(config);
  return config;
});

privateClient.interceptors.response.use(
  response => {
    const startedAt = (
      response.config as {metadata?: {startTime?: number}}
    ).metadata?.startTime;
    const elapsedMs = startedAt ? Date.now() - startedAt : undefined;
    logApiResponse(response, elapsedMs);
    return response;
  },
  (error: AxiosError) => {
    const startedAt = (
      error.config as {metadata?: {startTime?: number}} | undefined
    )?.metadata?.startTime;
    const elapsedMs = startedAt ? Date.now() - startedAt : undefined;
    logApiError(error, elapsedMs);
    return Promise.reject(error);
  },
);
