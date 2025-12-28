import env from "@/config/env";
import { getToken } from "./auth";

/**
 * Builds a full API URL from a relative endpoint path
 * 
 * @param endpoint The API endpoint path (without the base URL)
 * @returns Full API URL with the base URL from environment config
 */
export const buildApiUrl = (endpoint: string): string => {
  // Remove leading slash if present to avoid double slashes
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint.substring(1) : endpoint;
  return `${env.apiUrl}/${cleanEndpoint}`;
};

/**
 * Makes an authenticated API request with the auth token
 * 
 * @param endpoint The API endpoint path (without the base URL)
 * @param options Fetch request options
 * @returns Promise with the fetch response
 */
export const apiRequest = async (
  endpoint: string, 
  options: RequestInit = {}
): Promise<Response> => {
  const token = getToken();
  
  if (!token) {
    throw new Error('Authentication required');
  }
  
  const url = buildApiUrl(endpoint);
  
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
    ...options.headers
  };
  
  return fetch(url, {
    ...options,
    headers
  });
};

/**
 * Makes an authenticated GET request to the API
 */
export const apiGet = async <T>(endpoint: string): Promise<T> => {
  const response = await apiRequest(endpoint, { method: 'GET' });
  
  if (!response.ok) {
    throw new Error(`API error: ${response.status}`);
  }
  
  return response.json();
};

/**
 * Makes an authenticated POST request to the API
 */
export const apiPost = async <T>(endpoint: string, data: any): Promise<T> => {
  const response = await apiRequest(endpoint, {
    method: 'POST',
    body: JSON.stringify(data)
  });
  
  if (!response.ok) {
    throw new Error(`API error: ${response.status}`);
  }
  
  return response.json();
};

/**
 * Makes an authenticated PUT request to the API
 */
export const apiPut = async <T>(endpoint: string, data: any): Promise<T> => {
  const response = await apiRequest(endpoint, {
    method: 'PUT',
    body: JSON.stringify(data)
  });
  
  if (!response.ok) {
    throw new Error(`API error: ${response.status}`);
  }
  
  return response.json();
};

/**
 * Makes an authenticated DELETE request to the API
 */
export const apiDelete = async (endpoint: string): Promise<void> => {
  const response = await apiRequest(endpoint, { method: 'DELETE' });
  
  if (!response.ok) {
    throw new Error(`API error: ${response.status}`);
  }
}; 