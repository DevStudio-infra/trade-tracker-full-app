export interface AuthUser {
  id: string;
  email: string;
  role: "USER" | "ADMIN";
  name?: string;
}
