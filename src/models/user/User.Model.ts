import mongoose, { Schema } from 'mongoose';
import uuid from 'uuid';

import { UserData, CreateUser, FindUser } from './User.types';

mongoose.Promise = global.Promise;

const UserSchema = new Schema({
  userId: { type: String, default: uuid.v4 },
  username: String,
  name: String,
  email: String,
  password: String,
});

interface UserDataModel extends UserData, mongoose.Document {}

const User = mongoose.model<UserDataModel>('users', UserSchema);

export const UserModel = {
  async create(userData: CreateUser) {
    try {
      const createdUser = await User.create({ ...userData });

      return createdUser;
    } catch (error) {
      console.log(`Error creating user ${userData.username}`, error);
      throw Error(error);
    }
  },
  async findOne(userData: FindUser) {
    try {
      const user = await User.findOne({ ...userData });

      return user;
    } catch (error) {
      console.log(`Error finding user ${userData.username}`, error);
      throw Error(error);
    }
  },
  async checkExistence(username: string): Promise<boolean> {
    try {
      const meeting = await User.findOne({ username });

      return meeting !== null;
    } catch (error) {
      console.log(`Error checking user existence ${username}`, error);
      throw Error(error);
    }
  },
};
