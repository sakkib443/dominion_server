import express from 'express';
import OrderController from './order.controller';
import { authMiddleware, authorizeRoles } from '../../middlewares/auth';
import validateRequest from '../../middlewares/validateRequest';
import { createOrderValidation, updateOrderStatusValidation } from './order.validation';

const router = express.Router();

router.get('/my-orders', authMiddleware, OrderController.getMyOrders);
router.get('/stats', authMiddleware, authorizeRoles('admin'), OrderController.getStats);
router.get('/', authMiddleware, authorizeRoles('admin'), OrderController.getAll);
router.get('/:id', authMiddleware, OrderController.getById);
router.post('/', authMiddleware, validateRequest(createOrderValidation), OrderController.create);
router.patch('/:id/status', authMiddleware, authorizeRoles('admin'), validateRequest(updateOrderStatusValidation), OrderController.updateStatus);
router.patch('/:id/cancel', authMiddleware, OrderController.cancel);

export const OrderRoutes = router;
