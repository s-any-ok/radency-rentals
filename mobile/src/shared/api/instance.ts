import axios from 'axios';

import { API_URL } from '../config/env';

const REQUEST_TIMEOUT_MS = 15000;

export const instance = axios.create({
  baseURL: `${API_URL}/api`,
  timeout: REQUEST_TIMEOUT_MS,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
});
