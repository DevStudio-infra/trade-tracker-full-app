/**
 * User role types for role-based access control
 */
export type UserRole = 'admin' | 'staff' | 'user';

/**
 * API response types
 */
export interface ApiResponse<T> {
  data?: T;
  error?: string;
  status: number;
}

/**
 * User profile response type
 */
export interface UserProfile {
  id: number;
  clerkId: string;
  email: string;
  name?: string;
  imageUrl?: string;
  role: UserRole;
  createdAt: string;
  updatedAt: string;
}
