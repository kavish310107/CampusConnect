import express from 'express';
import auth from '../modules/authMiddleware.js';
import authorize from '../modules/authorize.js';
import { listClubs, listClubsWithStatus, createClub, joinClub, getPendingRequests, updateUserClubStatus, getClubMembers, updateUserClubStatusV2, getJoinedClubs } from '../controllers/clubsController.js';

const router = express.Router();

//get the list of all clubs
router.get('/list', listClubs);

//get the list of all clubs with membership status for the logged in user
router.get('/list-with-status', auth, listClubsWithStatus);

//get the list of clubs joined by the logged in student
router.get('/joined', auth, getJoinedClubs);

//create a new club, only doable by admin
router.post('/create', auth, authorize(['admin']), createClub);

// User joins a club
router.post('/:clubId/join', auth, joinClub);

// Admin fetches pending requests for a club
router.get('/:clubId/pendingrequests', auth, getPendingRequests);

// Admin approves or rejects a request
router.patch('/:clubId/users/:userId', auth, updateUserClubStatus);

// List approved club members
router.get('/:clubId/members', auth, getClubMembers);

// New: Update status with explicit endpoint and return updated row
router.patch('/:clubId/users/:userId/status', auth, updateUserClubStatusV2);

export default router;
