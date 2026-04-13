import { Review } from './review.model';
import AppError from '../../utils/AppError';
import QueryBuilder from '../../utils/QueryBuilder';

const ReviewService = {
    async getProductReviews(productId: string, query: Record<string, unknown>) {
        const reviewQuery = new QueryBuilder(
            Review.find({ product: productId, isApproved: true }).populate('user', 'firstName lastName avatar'),
            query
        ).sort().paginate();

        const reviews = await reviewQuery.modelQuery;
        const meta = await reviewQuery.countTotal();
        return { reviews, meta };
    },

    async createReview(userId: string, payload: any) {
        const exists = await Review.findOne({ product: payload.product, user: userId });
        if (exists) throw new AppError(400, 'You have already reviewed this product');
        return await Review.create({ ...payload, user: userId });
    },

    // Public (guest) review — no login required
    async publicCreateReview(payload: any) {
        const { product, rating, comment, userName } = payload;
        const review = await Review.create({
            product,
            rating,
            comment,
            userName: userName?.trim() || 'Anonymous',
            user: null,
        });

        // Update product stats: increment commentCount, reviewCount, recalculate rating
        const { Product } = require('../product/product.model');
        const allReviews = await Review.find({ product });
        const totalRating = allReviews.reduce((sum: number, r: any) => sum + (r.rating || 0), 0);
        const avgRating = allReviews.length > 0 ? totalRating / allReviews.length : 0;
        await Product.findByIdAndUpdate(product, {
            $inc: { commentCount: 1 },
            reviewCount: allReviews.length,
            rating: Math.round(avgRating * 10) / 10,
        });

        return review;
    },

    async updateReview(id: string, userId: string, payload: any) {
        const review = await Review.findOneAndUpdate(
            { _id: id, user: userId },
            payload,
            { new: true }
        );
        if (!review) throw new AppError(404, 'Review not found');
        return review;
    },

    async deleteReview(id: string, userId: string, isAdmin: boolean) {
        const filter = isAdmin ? { _id: id } : { _id: id, user: userId };
        const review = await Review.findOneAndDelete(filter);
        if (!review) throw new AppError(404, 'Review not found');
        return review;
    },

    async getAllReviews(query: Record<string, unknown>) {
        const reviewQuery = new QueryBuilder(
            Review.find().populate('user', 'firstName lastName').populate('product', 'name thumbnail'),
            query
        ).sort().paginate();
        const reviews = await reviewQuery.modelQuery;
        const meta = await reviewQuery.countTotal();
        return { reviews, meta };
    },
};

export default ReviewService;
