import express from 'express';
import { sendNotification ,getNotificationStatus} from '../controllers/notification.controller.js';

const router = express.Router();

router.post('/', sendNotification);
router.get('/:notificationId/status', getNotificationStatus);

export default router;
