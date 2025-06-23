import { useAuth } from "@clerk/nextjs";
import { ApiResponse } from "@/types";

/**
 * Base API URL from environment variable or default to localhost
 */
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

/**
 * Generic API client for making authenticated requests to the backend
 */
export async function fetchApi<T>(
  endpoint: string, 
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, options);
    const data = await response.json();
    
    return {
      data: data.data,
      error: data.error,
      status: response.status,
    };
  } catch (error) {
    console.error("API request failed:", error);
    return {
      error: "Failed to fetch data from API",
      status: 500,
    };
  }
}

/**
 * Hook for making authenticated API requests from client components
 * Automatically attaches the session token to the request
 */
export function useApiClient() {
  const { getToken } = useAuth();
  
  async function fetchWithAuth<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      // Get the token from Clerk
      const token = await getToken();
      
      // Prepare headers with authentication token
      const headers = new Headers(options.headers);
      
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }
      
      headers.set("Content-Type", "application/json");
      
      // Make the authenticated request
      return fetchApi<T>(endpoint, {
        ...options,
        headers,
      });
    } catch (error) {
      console.error("Authenticated API request failed:", error);
      return {
        error: "Failed to make authenticated request",
        status: 500,
      };
    }
  }
  
  return { fetch: fetchWithAuth };
}

/**
 * Server-side API client function for making authenticated requests
 * Used in server components and server actions
 * @param token Auth token from Clerk
 */
export async function fetchFromServer<T>(
  endpoint: string,
  token: string | null,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  try {
    // Prepare headers with authentication token
    const headers = new Headers(options.headers);
    
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }
    
    headers.set("Content-Type", "application/json");
    
    // Make the authenticated request
    return fetchApi<T>(endpoint, {
      ...options,
      headers,
    });
  } catch (error) {
    console.error("Server API request failed:", error);
    return {
      error: "Failed to make server request",
      status: 500,
    };
  }
}
