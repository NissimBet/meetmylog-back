import express from 'express';
import { groupController } from '../../controllers';
import { AuthenticateUser } from '../../middleware/Authentication';

// crear un router para pasarlo al servidor que use
export const router = express.Router({
  strict: true,
});

////////////////////////////////////////////////
//////////// Rutas de uso de grupos ////////////
////////////////////////////////////////////////

// sacar grupos de un usuario
router.get('/group/get', AuthenticateUser, groupController.getGroups);

// sacar datos de un grupo
router.get('/group/get/:id', AuthenticateUser, groupController.getGroup);

// crear un grupo nuevo
router.post('/group/new', AuthenticateUser, groupController.createGroup);

// agregar miembros al grupo
router.put(
  '/group/add/member/:id',
  AuthenticateUser,
  groupController.addMember
);

// eliminar un miembro de un grupo
router.post(
  '/group/remove/member/:id',
  AuthenticateUser,
  groupController.removeMember
);
