import mongoose, { Schema } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';
import { GroupData, CreateGroup } from './Group.types';
import { extractProperties } from '../../utils';
import { UserData } from '../user/User.types';

// que mongoose use las promsas globales internamente
mongoose.Promise = global.Promise;

// el esquema de un meeting
const GroupSchema = new Schema({
  // id externo a mongo, creado aleatoria y dinamicamente
  groupId: { type: String, default: () => uuidv4() },
  name: String,
  creator: { type: Schema.Types.ObjectId, ref: 'users' },
  members: [{ type: Schema.Types.ObjectId, ref: 'users' }],
  meetings: [{ type: Schema.Types.ObjectId, ref: 'meetings' }],
});

interface GroupDataModel extends GroupData, mongoose.Document {}

const Group = mongoose.model<GroupDataModel>('groups', GroupSchema);

export const GroupModel = {
  /**
   * crear un grupo nuevo en la base de datos
   * @param groupData datos del grupo que se quiere crear
   */
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
  /**
   * buscar un grupo en especifico, con los datos de las referencias
   * @param groupId identificador del grupo que se buscar
   */
  async get(groupId: string) {
    try {
      const group = await Group.findOne({ groupId })
        .populate('creator', 'userId username name')
        .populate('members', 'userId username name')
        .populate('meetings');

      return extractPublicProperties(group);
    } catch (error) {
      console.log(`Error, could not find group with id ${groupId}`, error);
      throw Error(error);
    }
  },
  /**
   * buscar los grupos a los que pertences un usuario
   * @param user_id identificdor del usuario que se quiere buscar
   */
  async getManyOfUser(user_id: string) {
    try {
      const groups = await Group.find({
        $or: [
          { creator: user_id },
          { members: { $elemMatch: { $eq: user_id } } },
        ],
      }).populate('members', 'userId username name');

      // siendo un arreglo, regresar el arreglo con las propiedades publicas de cada elemento
      return groups.map((group) => extractPublicProperties(group));
    } catch (error) {
      console.log(`Error finding groups for user ${user_id}`, error);
      throw Error(error);
    }
  },
  /**
   * agregar un miembro al grupo
   * @param groupId identificador del grupo
   * @param member identificador del miembro que se quiere agregar
   */
  async pushMember(groupId: string, members: any[]): Promise<GroupDataModel> {
    try {
      const group = await Group.findOne({ groupId });
      for (const member of members) {
        if (!group.members.includes(member._id)) {
          group.members.push(member);
          await group.save();
        }
      }

      return group;
    } catch (error) {
      console.log(`Error, Could not update ${groupId}`, error);
      throw Error(error);
    }
  },

  /**
   * quita un miembro al grupo
   * @param groupId identificador del grupo
   * @param member identificador del miembro que se quiere agregar
   */
  async popMember(groupId: string, member: string): Promise<GroupDataModel> {
    try {
      const group = await Group.findOne({ groupId });
      if (group.members.includes(member)) {
        const index = group.members.findIndex((id) => id == member);
        group.members.splice(index, 1);
        await group.save();
      }
      return group;
    } catch (error) {
      console.log(`Error, Could not update ${groupId}`, error);
      throw Error(error);
    }
  },
};

/**
 * extraer los datos publicos del grupo
 * @param group instancia del grupo al cual se quiere copiar
 */
export function extractPublicProperties(group: GroupDataModel) {
  return extractProperties(group, [
    'groupId',
    'name',
    'creator',
    'members',
    'meetings',
    '_id',
  ]);
}
