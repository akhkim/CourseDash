/**
 * Utility function for making authenticated API requests
 */

// Get the auth token from localStorage
const getAuthToken = (): string | null => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('auth_token');
  }
  return null;
};

interface FetchOptions extends RequestInit {
  requireAuth?: boolean;
}

/**
 * Enhanced fetch function that automatically includes authentication
 * @param url The URL to fetch
 * @param options Fetch options including requireAuth flag
 * @returns Response from the fetch request
 */
export const authFetch = async (
  url: string,
  options: FetchOptions = {}
): Promise<Response> => {
  const { requireAuth = true, headers = {}, ...rest } = options;
  
  // Create a new headers object
  const requestHeaders: HeadersInit = { ...headers };
  
  // Add auth token if required and available
  if (requireAuth) {
    const token = getAuthToken();
    if (token) {
      requestHeaders['Authorization'] = `Bearer ${token}`;
    }
  }
  
  // Add content-type if not already set
  if (!requestHeaders['Content-Type'] && !requestHeaders['content-type']) {
    requestHeaders['Content-Type'] = 'application/json';
  }
  
  // Make the request
  return fetch(url, {
    ...rest,
    headers: requestHeaders,
  });
};

/**
 * Checks if the user is authenticated by verifying the token with the server
 * @returns Promise resolving to the authenticated user or null
 */
export const checkAuth = async (): Promise<any> => {
  try {
    const response = await authFetch('/api/auth/me');
    
    if (response.ok) {
      return await response.json();
    }
    
    return null;
  } catch (error) {
    console.error('Error checking authentication:', error);
    return null;
  }
}; 