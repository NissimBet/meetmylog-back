import express from 'express';
import { groupController } from '../../controllers';

export const router = express.Router({
  strict: true,
});

router.get('/group/get', groupController.getGroups);
router.get('/group/get/:id', groupController.getGroup);
router.post('/group/new', groupController.createGroup);
router.put('/group/add/member/:id', groupController.addMember);
