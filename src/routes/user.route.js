import express from 'express';
import { getUserNotifications } from '../controllers/user.controller.js';
import { createUser } from '../controllers/user.controller.js';

const router = express.Router();

router.post('/create-user', createUser);
router.get('/:id/notifications', getUserNotifications);

export default router;
