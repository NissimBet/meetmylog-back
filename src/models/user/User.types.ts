export interface CreateUser {
  username: string;
  name: string;
  email: string;
  password: string;
}

export interface FindUser {
  email: string;
  password: string;
}

export interface GetUser {
  userId: string;
}

export interface UserData {
  userId: string;
  username: string;
  name: string;
  email: string;
  password: string;
}

export interface CheckUser {
  userId?: string;
  email?: string;
}
