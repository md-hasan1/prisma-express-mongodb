import { UserRole, UserStatus } from "@prisma/client";

export interface IUser {
  id?: string;
  fullName: string;
  email: string;
  country: string;
  profileImage?: string;
  password: string;
  fcmToken?: string;
  role?: UserRole;
  status?: UserStatus;
  isCompleteProfile?: boolean;
  otp?: number | null;
  expirationOtp?: Date | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export type IUserFilterRequest = {
  email?: string;
  role?: string;
  status?: string;
  searchTerm?: string;
}