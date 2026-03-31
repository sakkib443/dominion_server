import { z } from 'zod';

export const createProductValidation = z.object({
    body: z.object({
        name: z.string().min(1, 'Product name is required').max(200),
        description: z.string().min(1, 'Description is required'),
        shortDescription: z.string().max(500).optional(),
        tagline: z.string().max(200).optional(),
        priceType: z.enum(['fixed', 'negotiable']).optional(),
        slug: z.string().optional(),
        price: z.number().min(0, 'Price must be positive'),
        originalPrice: z.number().min(0).optional().nullable(),
        costPrice: z.number().min(0).optional().nullable(),
        discount: z.number().min(0).max(100).optional(),
        thumbnail: z.string().min(1, 'Thumbnail is required'),
        images: z.array(z.string()).optional(),
        category: z.string().min(1, 'Category is required'),
        subcategory: z.string().optional().nullable(),
        brand: z.string().optional(),
        stock: z.number().min(0).optional(),
        lowStockThreshold: z.number().min(0).optional(),
        unit: z.string().optional(),
        status: z.enum(['active', 'draft', 'out-of-stock']).optional(),
        visibility: z.enum(['visible', 'hidden']).optional(),
        isFeatured: z.boolean().optional(),
        isNewProduct: z.boolean().optional(),
        isOnSale: z.boolean().optional(),

        // Image search fields
        tags: z.array(z.string()).optional(),
        colors: z.array(z.string()).optional(),
        colorHex: z.array(z.string()).optional(),
        sizes: z.array(z.string()).optional(),
        weights: z.array(z.string()).optional(),
        material: z.array(z.string()).optional(),
        pattern: z.string().optional(),
        gender: z.enum(['men', 'women', 'unisex', 'kids', '']).optional(),
        aiLabels: z.array(z.string()).optional(),

        // Specifications & Highlights
        specifications: z.array(z.object({ key: z.string(), value: z.string() })).optional(),
        highlights: z.array(z.string()).optional(),

        // Shipping
        weight: z.number().optional(),
        dimensions: z.object({ length: z.number(), width: z.number(), height: z.number() }).optional(),
        shippingConfig: z.object({
            freeShipping: z.boolean().optional(),
            shippingCost: z.number().min(0).optional(),
            estimatedDays: z.number().min(0).optional(),
        }).optional(),

        // Warranty
        warranty: z.object({
            hasWarranty: z.boolean().optional(),
            duration: z.number().min(0).optional(),
            durationUnit: z.enum(['days', 'months', 'years']).optional(),
            type: z.enum(['manufacturer', 'seller', 'brand', '']).optional(),
        }).optional(),

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
