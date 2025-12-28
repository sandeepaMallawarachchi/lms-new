// Authentication service for handling login and API calls
import env from "@/config/env";

const API_URL = env.apiUrl;

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
}

/**
 * Login user with provided credentials
 */
export async function login(credentials: LoginCredentials): Promise<LoginResponse> {
  const response = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(credentials),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'Unknown error occurred' }));
    throw new Error(errorData.message || 'Login failed');
  }

  const data = await response.json();
  
  // Store token in localStorage for direct access in components
  if (typeof window !== 'undefined') {
    localStorage.setItem(env.tokenKey, data.token);
  }

  return data;
}

/**
 * Get the auth token from cookies or localStorage
 */
export function getToken(): string | null {
  // Try localStorage first
  if (typeof window !== 'undefined') {
    const localToken = localStorage.getItem(env.tokenKey);
    if (localToken) return localToken;
  }
  
  // Fallback to cookies
  if (typeof document !== 'undefined') {
    const cookies = document.cookie.split(';');
    const authCookie = cookies.find(cookie => cookie.trim().startsWith('auth='));
    return authCookie ? decodeURIComponent(authCookie.split('=')[1]) : null;
  }
  
  return null;
}

/**
 * Create a fetch wrapper that adds the authorization header
 */
export async function fetchWithAuth(url: string, options: RequestInit = {}): Promise<Response> {
  const token = getToken();
  
  if (!token) {
    throw new Error('No authentication token found');
  }
  
  const headers = {
    ...options.headers,
    'Authorization': `Bearer ${token}`,
  };
  
  return fetch(url, {
    ...options,
    headers,
  });
}

/**
 * Logout user by removing the auth cookie and localStorage
 */
export function logout(): void {
  // Clear cookie
  document.cookie = 'auth=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
  
  // Clear localStorage
  if (typeof window !== 'undefined') {
    localStorage.removeItem(env.tokenKey);
  }
  
  window.location.href = '/login';
} 