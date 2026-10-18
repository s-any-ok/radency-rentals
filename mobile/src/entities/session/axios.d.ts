import 'axios';

declare module 'axios' {
  interface AxiosRequestConfig {
    /** Set on auth endpoints so a 401 doesn't trigger a token refresh. */
    skipAuthRefresh?: boolean;
  }

  interface InternalAxiosRequestConfig {
    /** Set once a request has been retried after a token refresh. */
    retriedAfterRefresh?: boolean;
  }
}
