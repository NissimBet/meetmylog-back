import mongoose, { Schema } from 'mongoose';
import { SECRET } from '../../utils/config';

mongoose.Promise = global.Promise;

const UserSchema = new Schema({
  username: { type: String },
  email: { type: String },
  pasword: { type: String },
});

interface UserData extends mongoose.Document {
  username: string;
  email: string;
  pasword: string;
}

const User = mongoose.model<UserData>('users', UserSchema);

interface CreateUser {
  username: string;
  email: string;
  password: string;
}

export const UserModel = {
  async create(userData: CreateUser) {
    try {
      const createStatus = await User.create({ ...userData });

      return createStatus;
    } catch (error) {
      throw Error(error);
    }
  },
};
