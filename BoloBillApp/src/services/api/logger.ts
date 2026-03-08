import {AxiosError, AxiosRequestConfig, AxiosResponse} from 'axios';

const normalizePayload = (payload: unknown) => {
  if (!payload) {
    return payload;
  }

  const maybeFormData = payload as { _parts?: Array<[string, unknown]> };
  if (Array.isArray(maybeFormData._parts)) {
    const formDataObject = maybeFormData._parts.reduce<Record<string, unknown>>(
      (acc, [key, value]) => {
        acc[key] = value;
        return acc;
      },
      {},
    );
    return {
      __type: 'FormData',
      ...formDataObject,
    };
  }

  return payload;
};

const fullUrl = (config?: AxiosRequestConfig) => {
  if (!config) {
    return '';
  }
  return `${config.baseURL ?? ''}${config.url ?? ''}`;
};

export const logApiRequest = (config: AxiosRequestConfig) => {
  if (!__DEV__) {
    return;
  }
  // eslint-disable-next-line no-console
  console.log('[API REQUEST]', {
    method: config.method?.toUpperCase(),
    url: fullUrl(config),
    params: config.params,
    payload: normalizePayload(config.data),
  });
};

export const logApiResponse = (response: AxiosResponse, elapsedMs?: number) => {
  if (!__DEV__) {
    return;
  }
  // eslint-disable-next-line no-console
  console.log('[API RESPONSE]', {
    method: response.config.method?.toUpperCase(),
    url: fullUrl(response.config),
    status: response.status,
    elapsedMs,
    data: response.data,
  });
};

export const logApiError = (error: AxiosError, elapsedMs?: number) => {
  if (!__DEV__) {
    return;
  }
  // eslint-disable-next-line no-console
  console.log('[API ERROR]', {
    method: error.config?.method?.toUpperCase(),
    url: fullUrl(error.config),
    status: error.response?.status,
    elapsedMs,
    requestPayload: normalizePayload(error.config?.data),
    responseData: error.response?.data,
    message: error.message,
  });
};
