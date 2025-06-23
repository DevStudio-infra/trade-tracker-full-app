import { currentUser, auth } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import { UserRole } from "@/types";

/**
 * Get the current authenticated user from Clerk
 * Used in server components and server actions
 */
export async function getAuthUser() {
  const user = await currentUser();
  return user;
}

/**
 * Check if the current user has a specific role
 * Used in server components and server actions
 */
export async function hasRole(role: UserRole) {
  const { userId } = auth();
  
  if (!userId) {
    return false;
  }
  
  const user = await currentUser();
  
  if (!user) {
    return false;
  }
  
  // Get role from user public metadata
  // You can customize this based on how you store roles in Clerk user metadata
  const userRole = user.publicMetadata.role as UserRole | undefined;
  
  if (!userRole) {
    return false;
  }
  
  return userRole === role;
}

/**
 * Redirect to sign-in if not authenticated
 * Used in server components and server actions
 */
export async function requireAuth() {
  const { userId } = auth();
  
  if (!userId) {
    redirect("/sign-in");
  }
  
  return userId;
}

/**
 * Require a specific role to access a route
 * Used in server components and server actions
 * @param role The role to check for
 * @param redirectTo Where to redirect if the user doesn't have the required role
 */
export async function requireRole(role: UserRole, redirectTo = "/") {
  const { userId } = auth();
  
  if (!userId) {
    redirect("/sign-in");
  }
  
  const hasRequiredRole = await hasRole(role);
  
  if (!hasRequiredRole) {
    redirect(redirectTo);
  }
}
