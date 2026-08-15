export interface AuthUser {
  id: number;
  nama: string;
  role: 'admin' | 'operator' | 'pic' | 'koordinator' | 'viewer';
}

export interface AuthStateModel {
  token: string | null;
  user: AuthUser | null;
  isLoading: boolean;
}
