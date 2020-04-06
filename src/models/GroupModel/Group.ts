import mongoose, { Schema } from 'mongoose';
import { SECRET } from '../../utils/config';

mongoose.Promise = global.Promise;

const GroupSchema = new Schema({
  name: String,
  creator: { type: Schema.Types.ObjectId, ref: 'user' },
  members: [{ type: Schema.Types.ObjectId, ref: 'user' }],
});

interface GroupData extends mongoose.Document {
  username: string;
  email: string;
  pasword: string;
}

const Group = mongoose.model<GroupData>('groups', GroupSchema);

interface CreateGroup {
  username: string;
  email: string;
  password: string;
}

export const GroupModel = {
  async create(groupData: CreateGroup) {
    try {
      const createStatus = await Group.create({ ...groupData });

      return createStatus;
    } catch (error) {
      throw Error(error);
    }
  },
};
