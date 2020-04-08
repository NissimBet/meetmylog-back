import express from 'express';
import { groupController } from '../../controllers';

// crear un router para pasarlo al servidor que use
export const router = express.Router({
  strict: true,
});

////////////////////////////////////////////////
//////////// Rutas de uso de grupos ////////////
////////////////////////////////////////////////

// sacar grupos de un usuario
router.get('/group/get', groupController.getGroups);

// sacar datos de un grupo
router.get('/group/get/:id', groupController.getGroup);

// crear un grupo nuevo
router.post('/group/new', groupController.createGroup);

// agregar miembros al grupo
router.put('/group/add/member/:id', groupController.addMember);
