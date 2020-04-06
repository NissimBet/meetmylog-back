import mongoose, { Schema } from 'mongoose';
import uuid from 'uuid';
import { GroupData, CreateGroup } from './Group.types';

mongoose.Promise = global.Promise;

const GroupSchema = new Schema({
  groupId: { type: String, default: uuid.v4 },
  name: String,
  creator: { type: Schema.Types.ObjectId, ref: 'user' },
  members: [{ type: Schema.Types.ObjectId, ref: 'user' }],
  meetings: [{ type: Schema.Types.ObjectId, ref: 'meeting' }],
});

interface GroupDataModel extends GroupData, mongoose.Document {}

const Group = mongoose.model<GroupDataModel>('groups', GroupSchema);

export const GroupModel = {
  async create(groupData: CreateGroup): Promise<GroupDataModel> {
    try {
      const createdGroup = await Group.create({ ...groupData });

      return createdGroup;
    } catch (error) {
      console.log(
        `Error creating group ${groupData.name} for ${groupData.creator}`,
        error
      );
      throw Error(error);
    }
  },
  async get(groupId: string): Promise<GroupDataModel> {
    try {
      const group = await Group.findOne({ groupId });

      return group;
    } catch (error) {
      console.log(`Error, could not find group with id ${groupId}`, error);
      throw Error(error);
    }
  },
  async update(groupId: string, member: string): Promise<GroupDataModel> {
    try {
      const update = await Group.updateOne(
        { groupId },
        { $push: { members: member } }
      );

      return update;
    } catch (error) {
      console.log(`Error, Could not update ${groupId}`, error);
      throw Error(error);
    }
  },
};