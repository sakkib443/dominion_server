import { z } from 'zod';

export const createCategoryValidation = z.object({
    body: z.object({
        name: z.string().min(1, 'Category name is required').max(100),
        icon: z.string().optional(),
        image: z.string().optional(),
        parent: z.string().optional(),
        order: z.number().optional(),
    }),
});

export const updateCategoryValidation = z.object({
    body: z.object({
        name: z.string().min(1).max(100).optional(),
        icon: z.string().optional(),
        image: z.string().optional(),
        parent: z.string().optional(),
        order: z.number().optional(),
        isActive: z.boolean().optional(),
    }),
});
