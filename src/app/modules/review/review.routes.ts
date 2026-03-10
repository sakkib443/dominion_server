import express from 'express';
import ReviewController from './review.controller';
import { authMiddleware, authorizeRoles } from '../../middlewares/auth';
import validateRequest from '../../middlewares/validateRequest';
import { createReviewValidation, updateReviewValidation } from './review.validation';

const router = express.Router();

router.get('/product/:productId', ReviewController.getProductReviews);
router.get('/', authMiddleware, authorizeRoles('admin'), ReviewController.getAll);
router.post('/', authMiddleware, validateRequest(createReviewValidation), ReviewController.create);
router.patch('/:id', authMiddleware, validateRequest(updateReviewValidation), ReviewController.update);
router.delete('/:id', authMiddleware, ReviewController.delete);

export const ReviewRoutes = router;
