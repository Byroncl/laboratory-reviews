export interface IUserProfile {
  _id?: string;
  id?: string;
  name: string;
  lastname: string;
  email: string;
  username: string;
  phone?: string;
  bio?: string;
  role?: string;
  avatar?: string;
  createdAt?: Date;
  updatedAt?: Date;
  lastLoginAt?: Date;
}

export interface IProfileUpdate {
  name?: string;
  lastname?: string;
  email?: string;
  phone?: string;
  bio?: string;
}

export interface IProfileResponse {
  data: IUserProfile;
  message: string;
}
