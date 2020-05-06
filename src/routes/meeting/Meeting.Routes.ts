import express from 'express';
import { meetingController } from '../../controllers';
import { AuthenticateUser } from '../../middleware/Authentication';

// crear un router para pasarlo al servidor a que lo use
export const router = express.Router({
  strict: true,
});

////////////////////////////////////////////////
/////////// Rutas de uso de meetings ///////////
////////////////////////////////////////////////

// sacar los meetings de un usuario
router.get('/meeting/get', AuthenticateUser, meetingController.getOfUser);

// sacar un meeting especifico
router.get('/meeting/get/:id', AuthenticateUser, meetingController.findById);

// crear meeting
router.post('/meeting/new', AuthenticateUser, meetingController.create);

// agregar un mensaje de chat al meeting
router.put('/meeting/chat/:id', AuthenticateUser, meetingController.addChat);

// cerrar el meeting
router.put(
  '/meeting/close/:id',
  AuthenticateUser,
  meetingController.closeMeeting
);
