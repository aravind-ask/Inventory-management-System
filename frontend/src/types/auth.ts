export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  name: string
  email: string;
  password: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    email: string;
  };
}
