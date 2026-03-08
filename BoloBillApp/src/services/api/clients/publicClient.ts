import axios, {AxiosError} from 'axios';
import {logApiError, logApiRequest, logApiResponse} from '../logger';

export const publicClient = axios.create({
  baseURL: 'https://api.example.com',
  timeout: 15_000,
});

publicClient.interceptors.request.use(config => {
  (config as {metadata?: {startTime: number}}).metadata = {startTime: Date.now()};
  logApiRequest(config);
  return config;
});

publicClient.interceptors.response.use(
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
