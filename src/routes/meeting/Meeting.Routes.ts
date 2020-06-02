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

router.get('/meeting/get/team', AuthenticateUser, meetingController.getOfTeam);

// sacar un meeting especifico
router.get('/meeting/get/:id', AuthenticateUser, meetingController.findById);

// crear meeting
router.post('/meeting/new', AuthenticateUser, meetingController.create);

// agregar un mensaje de chat al meeting
router.put('/meeting/chat/:id', AuthenticateUser, meetingController.addChat);

// actualizar notas de meeting
router.put(
  '/meeting/notes/:id',
  AuthenticateUser,
  meetingController.updateNotes
);

// agregar una responsabilidad
router.put(
  '/meeting/responsability/:id',
  AuthenticateUser,
  meetingController.addResponsability
);

// agregar una responsabilidad
router.post(
  '/meeting/responsability/remove/:id',
  AuthenticateUser,
  meetingController.removeResponsibility
);

// cerrar el meeting
router.put(
  '/meeting/close/:id',
  AuthenticateUser,
  meetingController.closeMeeting
);
