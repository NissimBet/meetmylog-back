import mongoose, { Schema } from 'mongoose';
import uuid from 'uuid';
import { SECRET } from '../../utils/config';

mongoose.Promise = global.Promise;

const UserSchema = new Schema({
  userId: { type: String, default: uuid.v4 },
  username: String,
  name: String,
  email: String,
  password: String,
});

interface UserData extends mongoose.Document {
  userId: string;
  username: string;
  name: string;
  email: string;
  password: string;
}

const User = mongoose.model<UserData>('users', UserSchema);

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

export const UserModel = {
  async create(userData: CreateUser) {
    try {
      const createStatus = await User.create({ ...userData });

      if (createStatus.errors) {
        throw Error(createStatus.errors);
      }

      return createStatus;
    } catch (error) {
      console.log(`Error creating user ${userData.username}`, error);
      throw Error(error);
    }
  },
  async findOne(userData: FindUser) {
    try {
      const loginStatus = await User.findOne({ ...userData });

      if (loginStatus.errors) {
        throw Error(loginStatus.errors);
      }

      return loginStatus;
    } catch (error) {
      console.log(`Error finding user ${userData.username}`, error);
      throw Error(error);
    }
  },
  async checkExistence(username?: string, email?: string): Promise<boolean> {
    try {
      const exists = await User.findOne({ username, email });

      return exists !== null;
    } catch (error) {
      console.log(`Error checking user existence ${username}`, error);
      throw Error(error);
    }
  },
};
