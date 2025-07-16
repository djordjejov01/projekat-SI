export interface UserApiResponse {
  userId: number;
  username: string;
  email: string;
  role: string; // assuming UserRole is serialized as a string
  creationTime: string; // ISO 8601 string
  lastLoginTime: string | null;
  isActive: boolean;
  password?: string;       // Optional
  firstName?: string;      // Optional
  lastName?: string;       // Optional
  language?: string;
  phoneNumber?: string;
  profilePicture?: string;
}