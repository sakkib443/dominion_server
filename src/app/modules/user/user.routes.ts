import express from 'express';
import UserController from './user.controller';
import { authMiddleware, authorizeRoles } from '../../middlewares/auth';
import validateRequest from '../../middlewares/validateRequest';
import { updateUserValidation, addAddressValidation, updateAddressValidation, updateStatusValidation } from './user.validation';

const router = express.Router();

// ── My Profile ─────────────────────────────────────────
router.get('/me', authMiddleware, UserController.getMyProfile);
router.patch('/me', authMiddleware, validateRequest(updateUserValidation), UserController.updateMyProfile);

// ── Shipping Addresses ─────────────────────────────────
router.post('/addresses', authMiddleware, validateRequest(addAddressValidation), UserController.addShippingAddress);
router.patch('/addresses/:addressId', authMiddleware, validateRequest(updateAddressValidation), UserController.updateShippingAddress);
router.delete('/addresses/:addressId', authMiddleware, UserController.deleteShippingAddress);

// ── Wishlist ───────────────────────────────────────────
router.post('/wishlist/:productId', authMiddleware, UserController.toggleWishlist);

// ── Admin Routes ────────────────────────────────────────
router.get('/', authMiddleware, authorizeRoles('admin'), UserController.getAllUsers);
router.get('/:id', authMiddleware, authorizeRoles('admin'), UserController.getUserById);
router.patch('/:id/status', authMiddleware, authorizeRoles('admin'), validateRequest(updateStatusValidation), UserController.updateUserStatus);
router.delete('/:id', authMiddleware, authorizeRoles('admin'), UserController.deleteUser);

export const UserRoutes = router;
