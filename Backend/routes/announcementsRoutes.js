import express from 'express';
import auth from '../modules/authMiddleware.js';
import authorize from '../modules/authorize.js';
import { listAnnouncements, createAnnouncement, getStudentFilteredAnnouncements } from '../controllers/announcementsController.js';

const router = express.Router();

router.get('/list', listAnnouncements);
router.get('/student-filtered', auth, getStudentFilteredAnnouncements);
router.post('/create', auth, createAnnouncement);

export default router;
