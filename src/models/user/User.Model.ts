import mongoose, { Schema } from 'mongoose';
import uuid from 'uuid';

import {
  UserData,
  CreateUser,
  FindUser,
  CheckUser,
  GetUser,
} from './User.types';

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
  async create(userData: CreateUser): Promise<UserDataModel> {
    try {
      const createdUser = await User.create({ ...userData });

      return createdUser;
    } catch (error) {
      console.log(`Error creating user ${userData.username}`, error);
      throw Error(error);
    }
  },
  async findOne(userData: FindUser): Promise<UserDataModel> {
    try {
      const user = await User.findOne({ ...userData });

      return user;
    } catch (error) {
      console.log(`Error finding user ${userData.email}`, error);
      throw Error(error);
    }
  },
  async getData({ userId }: GetUser): Promise<UserDataModel> {
    try {
      const user = await User.findOne({ userId });

      return user;
    } catch (error) {
      console.log(`Error finding user ${userId}`, error);
      throw Error(error);
    }
  },
  async checkExistence(userData: CheckUser): Promise<boolean> {
    try {
      if (userData === null) throw Error('data is null');

      const meeting = await User.findOne({
        $or: [{ email: userData.email }, { userId: userData.userId }],
      });

      return meeting !== null;
    } catch (error) {
      console.log(`Error checking user existence ${userData.email}`, error);
      throw Error(error);
    }
  },
};
