import express from 'express';
import { userController } from '../../controllers';

export const router = express.Router({
  strict: true,
});

router.post('/user/login', userController.login);
router.post('/user/register', userController.register);
router.get('/user/get/:id', userController.get);
router.get('/user/token', userController.validateToken);
