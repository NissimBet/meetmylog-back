import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

import { SECRET } from './config';

/// hashing stuff
const SaltingRounds = 10;

/**
 * encriptar un mensaje para que se (principalmente passwords)
 * @param message el mensaje que se va a hashear
 */
export async function encryptMessage(message: string): Promise<string> {
  return await bcrypt.hash(message, SaltingRounds);
}

/**
 * compara un texto con un hash para ver si son compatibles
 * @param plaintext texto que se quiere comparar
 * @param hash hash contra el cual se quiere comparar
 */
export async function compareHash(
  plaintext: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(plaintext, hash, (err, same) => same);
}

export interface TokenData {
  username: string;
  email: string;
  userId: string;
}

/**
 * genera un token con los datos del usuario.
 * tienen una duracion de 3 horas
 * @param data datos que se quieren almacenar en el token
 */
export function createToken(data: TokenData): string {
  const token = jwt.sign(data, SECRET, {
    expiresIn: 60 * 60 * 3,
  });
  return token;
}

/**
 * valida que el token sea correcto y sea posible de decodificar
 * @param token token que se quiere validar
 */
export function validateToken(token: string = ''): boolean {
  let wasDecoded = false;
  jwt.verify(
    extractBearer(token),
    SECRET,
    // !! lo que hace es !(!decoded)
    // si es !(!true) => true
    // si es !(!false) => false
    // se utiliza para si es un valor truey (un numero, string no vacio, arreglo no vacio, un objeto, etc)
    // poder regresar un booleano en vez del valor
    (_, decoded) => (wasDecoded = !!decoded)
  );
  return wasDecoded;
}

/**
 * extrae los datos del usuario del token
 * @param token token que se quieren extraer los datos
 */
export function extractToken(token: string = ''): TokenData {
  let data: TokenData = null;
  jwt.verify(
    extractBearer(token),
    SECRET,
    (_, decoded) => (data = <TokenData>decoded)
  );
  return data;
}

/**
 * extrae el string que representa el token
 * Los headers de autenticacion se mandan de forma "Bearer 'token'"
 * @param token token en formato "Bearer 'token'"
 */
export function extractBearer(token: string): string {
  return token.replace('Bearer ', '');
}

/**
 * crea una copia del objeto solo con las propiedades que se quieren extraer
 * @param obj objeto que se quiere extraer propiedades
 * @param keys llaves / nombres de las propiedades del objeto a extraer
 */
export function extractProperties<T, K extends keyof T>(
  obj: T,
  keys: Array<K>
): Pick<T, K> {
  // nuevo objeto
  const ret: any = {};
  // iterar las llaves del original y copiar los datos
  keys.forEach((key) => {
    ret[key] = obj[key];
  });
  return ret;
}
