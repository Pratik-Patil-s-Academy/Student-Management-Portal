import express from 'express';
import { getAdminProfile, loginAdmin, logOutUser } from '../controllers/adminController.js';
import { isAuth } from '../middlewares/isAuth.js';

const router = express.Router();

router.post('/login', loginAdmin);
router.post('/logout', logOutUser);
router.get('/profile',isAuth, getAdminProfile);
export default router;
