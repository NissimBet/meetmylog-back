import express from 'express';
import { meetingController } from '../../controllers';

export const router = express.Router({
  strict: true,
});

router.get('/meeting/get', meetingController.getOfUser);
router.get('/meeting/get/:id', meetingController.findById);
router.post('/meeting/new', meetingController.create);
router.put('/meeting/:id', meetingController.addChat);
