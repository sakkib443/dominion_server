import { z } from 'zod';

export const createReviewValidation = z.object({
    body: z.object({
        product: z.string().min(1, 'Product ID required'),
        rating: z.number().min(1).max(5),
        title: z.string().max(100).optional(),
        comment: z.string().min(1, 'Comment is required').max(1000),
        images: z.array(z.string()).optional(),
    }),
});

export const updateReviewValidation = z.object({
    body: z.object({
        rating: z.number().min(1).max(5).optional(),
        title: z.string().max(100).optional(),
        comment: z.string().max(1000).optional(),
    }),
});
