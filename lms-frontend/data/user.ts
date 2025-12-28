import { API_BASE_URL } from "./api";
import { getToken } from "@/lib/auth";

export interface Permission {
  id: number;
  name: string;
  description: string;
}

export interface Role {
  id: number;
  name: string;
  permissions: Permission[];
}

export interface Authority {
  authority: string;
}

export interface UserProfile {
  id: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  contactNumber: string;
  active: boolean;
  roles: Role[];
  enabled: boolean;
  accountNonExpired: boolean;
  accountNonLocked: boolean;
  credentialsNonExpired: boolean;
  authorities: Authority[];
  profileImage?: string;
}

/**
 * Fetch the current logged in user's profile
 */
export async function getCurrentUser(): Promise<UserProfile | null> {
  try {
    const token = getToken();
    
    if (!token) {
      console.warn('No authentication token found. User is not logged in.');
      return null;
    }
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': `Bearer ${token}`
    };
    
    const response = await fetch(`${API_BASE_URL}/users/current`, {
      method: 'GET',
      headers,
      credentials: 'include'
    });
    
    if (!response.ok) {
      console.error('Failed to fetch current user:', response.status, response.statusText);
      return null;
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching current user profile:', error);
    return null;
  }
} 