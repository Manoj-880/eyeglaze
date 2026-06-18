import { Router } from 'express';
import { requireAuth } from '../middleware/requireAuth';
import {
  sendOTP,
  verifyOTP,
  register,
  login,
  logout,
  getMe,
  updateProfile,
  addAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
  addCard,
  deleteCard,
  toggleWallet,
  addMoney,
  deleteAccount,
  activateMembership
} from '../controllers/auth.controller';

const router = Router();

router.post('/send-otp', sendOTP);
router.post('/verify-otp', verifyOTP);
router.post('/register', register);
router.post('/login', login);
router.post('/logout', logout);
router.get('/me', requireAuth, getMe);

router.put('/profile', requireAuth, updateProfile);
router.delete('/profile', requireAuth, deleteAccount);

router.post('/addresses', requireAuth, addAddress);
router.put('/addresses/:id', requireAuth, updateAddress);
router.delete('/addresses/:id', requireAuth, deleteAddress);
router.put('/addresses/:id/default', requireAuth, setDefaultAddress);

router.post('/cards', requireAuth, addCard);
router.delete('/cards/:id', requireAuth, deleteCard);
router.put('/wallets/:walletId', requireAuth, toggleWallet);
router.post('/wallet/add', requireAuth, addMoney);
router.post('/membership/activate', requireAuth, activateMembership);

export default router;
