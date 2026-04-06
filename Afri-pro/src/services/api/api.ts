import { ENV } from '../../config/env';

const BASE_URL = ENV.API_URL;

export const api = {
  get: (path: string, token?: string) =>
    fetch(`${BASE_URL}${path}`, {
      headers: { Authorization: token ? `Bearer ${token}` : '' },
    }).then(r => r.json()),

  post: (path: string, body: object, token?: string) =>
    fetch(`${BASE_URL}${path}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: token ? `Bearer ${token}` : '',
      },
      body: JSON.stringify(body),
    }).then(r => r.json()),
};