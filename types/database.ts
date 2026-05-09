export type UserRole = "user" | "admin";

export interface User {
  id: string;
  email: string;
  name: string | null;
  role: UserRole;
  avatar_url: string | null;
  created_at: string;
}

export interface Pass {
  id: string;
  user_id: string;
  plan_name: string;
  total_count: number;
  used_count: number;
  expires_at: string;
  is_active: boolean;
  purchased_at: string;
}

export interface Checkin {
  id: string;
  pass_id: string;
  user_id: string;
  checked_in_at: string;
  staff_id: string | null;
  note: string | null;
}

export interface PassWithUser extends Pass {
  users: Pick<User, "name" | "email" | "avatar_url">;
}
