import { z } from 'zod';

export const createProductValidation = z.object({
    body: z.object({
        name: z.string().min(1, 'Product name is required').max(200),
        description: z.string().min(1, 'Description is required'),
        shortDescription: z.string().max(500).optional(),
        price: z.number().min(0, 'Price must be positive'),
        originalPrice: z.number().min(0).optional(),
        discount: z.number().min(0).max(100).optional(),
        thumbnail: z.string().min(1, 'Thumbnail is required'),
        images: z.array(z.string()).optional(),
        category: z.string().min(1, 'Category is required'),
        subcategory: z.string().optional(),
        brand: z.string().optional(),
        stock: z.number().min(0).optional(),
        unit: z.string().optional(),
        status: z.enum(['active', 'draft', 'out-of-stock']).optional(),
        isFeatured: z.boolean().optional(),

        // Image search fields
        tags: z.array(z.string()).optional(),
        colors: z.array(z.string()).optional(),
        colorHex: z.array(z.string()).optional(),
        material: z.array(z.string()).optional(),
        pattern: z.string().optional(),
        gender: z.enum(['men', 'women', 'unisex', 'kids', '']).optional(),
        aiLabels: z.array(z.string()).optional(),

        // Specifications
        specifications: z.array(z.object({ key: z.string(), value: z.string() })).optional(),

        // Shipping
        weight: z.number().optional(),
        dimensions: z.object({ length: z.number(), width: z.number(), height: z.number() }).optional(),

        // SEO
        metaTitle: z.string().optional(),
        metaDescription: z.string().optional(),
        metaKeywords: z.array(z.string()).optional(),
    }),
});

export const updateProductValidation = z.object({
    body: createProductValidation.shape.body.partial(),
});

export const bulkStatusValidation = z.object({
    body: z.object({
        ids: z.array(z.string()).min(1),
        status: z.enum(['active', 'draft', 'out-of-stock']),
    }),
});

export const bulkDeleteValidation = z.object({
    body: z.object({
        ids: z.array(z.string()).min(1),
    }),
});
