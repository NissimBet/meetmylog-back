import express from 'express';
import { userController } from '../../controllers';

// crear un router para pasarlo al servidor que use
export const router = express.Router({
  strict: true,
});

////////////////////////////////////////////////
///////// Rutas de Acceso del usuario //////////
////////////////////////////////////////////////

// login
router.post('/user/login', userController.login);

// registro
router.post('/user/register', userController.register);

// tomar datos del usuario
router.get('/user/get/:id', userController.get);

// validar token
router.get('/user/token', userController.validateToken);
