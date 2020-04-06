import express from 'express';
import { userController } from '../../controllers';

export const router = express.Router({
  strict: true,
});

router.post('/user/login', userController.login);
router.get('/user', userController.get);
