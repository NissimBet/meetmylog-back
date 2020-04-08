import mongoose, { Schema } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

import { UserData, CreateUser, CheckUser, GetUser } from './User.types';
import { extractProperties } from '../../utils';

// que mongoose use las promsas globales internamente
mongoose.Promise = global.Promise;

// el esquema del usuario
const UserSchema = new Schema({
  // id externo a mongo, creado aleatoria y dinamicamente
  userId: { type: String, default: () => uuidv4() },
  username: String,
  name: String,
  email: String,
  // contrasena se encripta antes de guardarse
  password: String,
});

interface UserDataModel extends UserData, mongoose.Document {}

const User = mongoose.model<UserDataModel>('users', UserSchema);

// objeto con lo metodos de manejo del modelo de usuario
export const UserModel = {
  /**
   * crear un nuevo usuario en la base de datos
   * @param userData datos que se van a agregar al nuevo usuario
   */
  async create(userData: CreateUser): Promise<UserDataModel> {
    try {
      // crear un usuario con los datos de userData
      const createdUser = await User.create({ ...userData });

      return createdUser;
    } catch (error) {
      console.log(`Error creating user ${userData.username}`, error);
      throw Error(error);
    }
  },
  /**
   * busca a un usuario usando su userId o email, regresa solo los datos publicos
   * @param param0 datos unicos que identifican a un usuario
   */
  async getPublicData({ userId, email }: GetUser) {
    try {
      // si no se pasan datos, mandar error
      if (!userId && !email) throw Error('data is null');

      const user = await User.findOne({ $or: [{ userId }, { email }] });

      // si no se encontro un usuario, mandar nulo
      if (!user) {
        return null;
      }

      // solo mandar los datos publicos
      return extractPublicProperties(user);
    } catch (error) {
      console.log(`Error finding user ${userId}`, error);
      throw Error(error);
    }
  },
  /**
   * busca a un usuario usando su userId o email, regresa todos los datos
   * @param param0 datos unicos que identifican a un usuario
   */
  async getData({ userId, email }: GetUser) {
    try {
      if (!userId && !email) throw Error('data is null');

      const user = await User.findOne({ $or: [{ userId }, { email }] });

      return user;
    } catch (error) {
      console.log(`Error finding user ${userId}`, error);
      throw Error(error);
    }
  },
  /**
   * busca a un usuario y revisa si existe
   * @param userData datos que identifican al usuario
   */
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

/**
 * extraer los datos publicos del user
 * @param user instancia de usuario al cual se quiere copiar
 */
export function extractPublicProperties(user: UserDataModel) {
  return extractProperties(user, [
    'username',
    'name',
    'email',
    'userId',
    '_id',
  ]);
}
