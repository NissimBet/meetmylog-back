import express from 'express';
import { meetingController } from '../../controllers';

// crear un router para pasarlo al servidor a que lo use
export const router = express.Router({
  strict: true,
});

////////////////////////////////////////////////
/////////// Rutas de uso de meetings ///////////
////////////////////////////////////////////////

// sacar los meetings de un usuario
router.get('/meeting/get', meetingController.getOfUser);

// sacar un meeting especifico
router.get('/meeting/get/:id', meetingController.findById);

// crear meeting
router.post('/meeting/new', meetingController.create);

// agregar un mensaje de chat al meeting
router.put('/meeting/chat/:id', meetingController.addChat);
