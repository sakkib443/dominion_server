import { Request, Response } from 'express';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import ReviewService from './review.service';

const ReviewController = {
    getProductReviews: catchAsync(async (req: Request, res: Response) => {
        const { reviews, meta } = await ReviewService.getProductReviews(req.params.productId, req.query as Record<string, unknown>);
        sendResponse(res, { statusCode: 200, success: true, message: 'Reviews fetched', data: reviews, meta });
    }),
    getAll: catchAsync(async (req: Request, res: Response) => {
        const { reviews, meta } = await ReviewService.getAllReviews(req.query as Record<string, unknown>);
        sendResponse(res, { statusCode: 200, success: true, message: 'All reviews fetched', data: reviews, meta });
    }),
    create: catchAsync(async (req: Request, res: Response) => {
        const review = await ReviewService.createReview(req.user!.userId, req.body);
        sendResponse(res, { statusCode: 201, success: true, message: 'Review submitted', data: review });
    }),
    publicCreate: catchAsync(async (req: Request, res: Response) => {
        const review = await ReviewService.publicCreateReview(req.body);
        sendResponse(res, { statusCode: 201, success: true, message: 'Comment submitted', data: review });
    }),
    update: catchAsync(async (req: Request, res: Response) => {
        const review = await ReviewService.updateReview(req.params.id, req.user!.userId, req.body);
        sendResponse(res, { statusCode: 200, success: true, message: 'Review updated', data: review });
    }),
    delete: catchAsync(async (req: Request, res: Response) => {
        await ReviewService.deleteReview(req.params.id, req.user!.userId, req.user!.role === 'admin');
        sendResponse(res, { statusCode: 200, success: true, message: 'Review deleted' });
    }),
};

export default ReviewController;
