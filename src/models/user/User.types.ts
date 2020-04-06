export interface CreateUser {
  username: string;
  name: string;
  email: string;
  password: string;
}

export interface FindUser {
  username: string;
  password: string;
}

export interface UserData {
  userId: string;
  username: string;
  name: string;
  email: string;
  password: string;
}
