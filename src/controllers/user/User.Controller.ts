import { Request, Response } from 'express';
import { UserModel } from '../../models';
import { FindUser, CreateUser } from '../../models/user/User.types';

import {
  encryptMessage,
  createToken,
  validateToken,
  extractToken,
  compareHash,
} from '../../utils';

export class UserController {
  /**
   * inicia sesion de un usuario, le regresa un token nuevo para realizar futuras llamadas
   * @param req request, tiene los datos de la llamada a la ruta
   * @param res response, tiene las funciones para resolver la llamada
   */
  async login(req: Request, res: Response) {
    try {
      // <Tipo> => utilizado para realizar un pseudo-cast al tipo
      const { email, password } = <FindUser>req.body;

      // si no hay ningun parametro, enviar error
      if (!email || !password) {
        res.statusMessage = 'Missing Parameters';
        return res.status(406).send();
      }

      // buscar el usuario en la db
      const user = await UserModel.getData({
        email,
      });

      if (!user) {
        res.statusMessage = 'User or password incorrect';
        return res.status(404).send(); // no se si sea 404 :p
      }

      // revisa que la contrasena enviada es la correcta
      const isPasswordMatch = await compareHash(password, user.password);
      if (isPasswordMatch) {
        res.statusMessage = 'User or password incorrect';
        return res.status(404).send(); // no se si sea 404 :pp
      }

      // extraer datos del usuario
      const { username, userId } = user;

      // generar token
      const token = createToken({ email, userId, username });

      // enviar token y datos del usuario
      return res.status(200).json({ email, userId, username, token });
    } catch (error) {
      console.error(error);
      return res.status(500);
    }
  }

  /**
   * busca los datos de un usuario
   * @param req request, tiene los datos de la llamada a la ruta
   * @param res response, tiene las funciones para resolver la llamada
   */
  async get(req: Request, res: Response) {
    try {
      // { data } = obj => data = obj.data
      // { id: userId } => userId = id
      const { id: userId } = req.params;

      // extraer token del header de autorizacion
      // token esta en formato "Bearer 'token'"
      const token = req.headers.authorization;
      const tokenData = extractToken(token);

      // si no hay token, error
      if (!tokenData) {
        res.statusMessage = 'User Unauthorized';
        return res.status(401).send();
      }

      // buscar usuario
      const user = await UserModel.getPublicData({ userId });
      if (!user) {
        res.statusMessage = 'User not found';
        return res.status(404).send();
      }

      // enviar usuario
      return res.status(200).json(user);
    } catch (error) {
      console.error(error);
      return res.status(500);
    }
  }
  /**
   * valida un token del usuario, regresa si fue valido o no
   * @param req request, tiene los datos de la llamada a la ruta
   * @param res response, tiene las funciones para resolver la llamada
   */
  async validateToken(req: Request, res: Response) {
    try {
      const token = req.headers.authorization;

      if (!token) {
        return res.status(401).send();
      }

      if (!validateToken(token)) {
        return res.status(401).send();
      }
      return res.status(200).send();
    } catch (error) {
      console.error(error);
      return res.status(500).send();
    }
  }

  /**
   * registrar (crer) un usuario
   * @param req request, tiene los datos de la llamada a la ruta
   * @param res response, tiene las funciones para resolver la llamada
   */
  async register(req: Request, res: Response) {
    try {
      const { username, email, password, name } = <CreateUser>req.body;

      // si falta un valor, mandar error
      if (!(username && email && password && name)) {
        res.statusMessage = 'Missing parameters';
        return res.status(406).send();
      }

      // encriptar contrasena
      const encryptedPass = await encryptMessage(password);

      // datos del usuario para enviar al
      const userData: CreateUser = {
        email,
        name,
        password: encryptedPass,
        username,
      };

      // revisar si el usuario existe
      const userExists = await UserModel.checkExistence({ email });
      if (userExists) {
        res.statusMessage = 'Username or email already in use';
        return res.status(409).send();
      }

      // crear usuario, crear token y enviarlo al cliente
      const user = await UserModel.create(userData);
      const token = createToken({ email, username, userId: user.userId });

      return res.status(201).json({ ...user, token });
    } catch (error) {
      return res.status(500);
    }
  }
}
