import type { UserRole } from 'src/shared/model';

/** Response of the ASP.NET Identity bearer token handler. */
export type AccessTokenResponse = {
  tokenType: 'Bearer';
  accessToken: string;
  /** Seconds until the access token expires. */
  expiresIn: number;
  refreshToken: string;
};

export type CurrentUserDto = {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
};

export type SignInRequest = {
  email: string;
  password: string;
};

export type SignUpRequest = SignInRequest & {
  fullName: string;
  role: UserRole;
};
