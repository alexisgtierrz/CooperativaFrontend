// Cliente HTTP mínimo para el backend Spring Boot.
// La URL base sale de VITE_API_BASE_URL (ver .env), por ejemplo http://localhost:8080/api

const RAW_BASE = (import.meta.env.VITE_API_BASE_URL as string | undefined) || 'http://localhost:8080/api';

export const API_BASE_URL = RAW_BASE.replace(/\/+$/, '');

export function getToken(): string | null {
  return localStorage.getItem('token');
}

export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

/**
 * fetch con la URL base y el token JWT ya incluidos.
 * `path` va relativo a /api, por ejemplo '/clientes/perfil-actual'.
 */
export async function apiFetch(path: string, options: RequestInit = {}): Promise<Response> {
  const headers = new Headers(options.headers);
  const token = getToken();
  if (token && !headers.has('Authorization')) headers.set('Authorization', `Bearer ${token}`);
  if (options.body && !headers.has('Content-Type')) headers.set('Content-Type', 'application/json');

  return fetch(`${API_BASE_URL}${path.startsWith('/') ? path : `/${path}`}`, { ...options, headers });
}

/** Igual que apiFetch pero devuelve el JSON y lanza ApiError si la respuesta no es 2xx. */
export async function apiJson<T>(path: string, options: RequestInit = {}): Promise<T> {
  const response = await apiFetch(path, options);
  if (!response.ok) {
    const mensaje =
      response.status === 401 || response.status === 403
        ? 'Tu sesión expiró o no tenés permisos para esta acción.'
        : `Error del servidor (${response.status})`;
    throw new ApiError(response.status, mensaje);
  }
  const text = await response.text();
  return (text ? JSON.parse(text) : null) as T;
}

/** Login contra /api/auth/login. Devuelve el token JWT. */
export async function loginRequest(email: string, password: string): Promise<string> {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  if (!response.ok) throw new Error('Credenciales inválidas');
  const data = await response.json();
  return data.token as string;
}
