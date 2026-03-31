import { Schema, model } from 'mongoose';

const specificationSchema = new Schema({
    key: { type: String }, value: { type: String },
}, { _id: false });

const warrantySchema = new Schema({
    hasWarranty: { type: Boolean, default: false },
    duration: { type: Number, default: 0 },
    durationUnit: { type: String, enum: ['days', 'months', 'years'], default: 'months' },
    type: { type: String, enum: ['manufacturer', 'seller', 'brand', ''], default: 'manufacturer' },
}, { _id: false });

const shippingConfigSchema = new Schema({
    freeShipping: { type: Boolean, default: false },
    shippingCost: { type: Number, default: 0 },
    estimatedDays: { type: Number, default: 3 },
}, { _id: false });

const productSchema = new Schema(
    {
        // ── Basic Info ──────────────────────────────────────────
        name: { type: String, required: [true, 'Product name is required'], trim: true, maxlength: 200 },
        slug: { type: String, unique: true, lowercase: true },
        sku: { type: String, unique: true, sparse: true },
        description: { type: String, required: [true, 'Description is required'] },
        shortDescription: { type: String, maxlength: 500, default: '' },
        tagline: { type: String, maxlength: 200, default: 'Lower price than others but quality higher' },
        priceType: { type: String, enum: ['fixed', 'negotiable'], default: 'negotiable' },

        // ── Pricing ─────────────────────────────────────────────
        price: { type: Number, required: [true, 'Price is required'], min: 0 },
        originalPrice: { type: Number, default: null },
        costPrice: { type: Number, default: null },
        discount: { type: Number, default: 0, min: 0, max: 100 }, // percentage

        // ── Images ──────────────────────────────────────────────
        thumbnail: { type: String, required: [true, 'Thumbnail is required'] },
        images: [{ type: String }],

        // ── Category & Brand ─────────────────────────────────────
        category: { type: Schema.Types.ObjectId, ref: 'Category', required: true },
        subcategory: { type: Schema.Types.ObjectId, ref: 'Category', default: null },
        brand: { type: String, default: '', trim: true },

        // ── Stock ────────────────────────────────────────────────
        stock: { type: Number, default: 0, min: 0 },
        lowStockThreshold: { type: Number, default: 5 },
        unit: { type: String, default: 'piece' },
        status: {
            type: String,
            enum: { values: ['active', 'draft', 'out-of-stock'], message: '{VALUE} is not valid' },
            default: 'active',
        },
        visibility: {
            type: String,
            enum: { values: ['visible', 'hidden'], message: '{VALUE} is not valid' },
            default: 'visible',
        },
        isFeatured: { type: Boolean, default: false },
        isNewProduct: { type: Boolean, default: true },
        isOnSale: { type: Boolean, default: false },
        isDeleted: { type: Boolean, default: false },

        // ── 🔍 IMAGE SEARCH FIELDS ───────────────────────────────
        // These fields make image search 100% accurate
        tags: { type: [String], default: [] },          // ['sneaker', 'running', 'sport']
        colors: { type: [String], default: [] },        // ['red', 'white', 'black']
        colorHex: { type: [String], default: [] },      // ['#FF0000', '#FFFFFF']
        sizes: { type: [String], default: [] },          // ['S', 'M', 'L', 'XL', 'XXL']
        weights: { type: [String], default: [] },        // ['100g', '250g', '500g', '1kg']
        material: { type: [String], default: [] },      // ['leather', 'mesh', 'cotton']
        pattern: { type: String, default: '' },         // 'solid', 'striped', 'floral', 'camo'
        gender: {
            type: String,
            enum: { values: ['men', 'women', 'unisex', 'kids', ''], message: '{VALUE} is not valid' },
            default: '',
        },
        aiLabels: { type: [String], default: [] },      // AI-generated: ['shoe', 'footwear', 'athletic']

        // ── Specifications & Highlights ────────────────────────────
        specifications: { type: [specificationSchema], default: [] },
        highlights: { type: [String], default: [] },

        // ── Shipping ──────────────────────────────────────────────
        weight: { type: Number, default: 0 },           // in grams
        dimensions: {
            length: { type: Number, default: 0 },
            width: { type: Number, default: 0 },
            height: { type: Number, default: 0 },
        },
        shippingConfig: { type: shippingConfigSchema, default: () => ({}) },

        // ── Warranty ──────────────────────────────────────────────
        warranty: { type: warrantySchema, default: () => ({}) },

        // ── SEO ───────────────────────────────────────────────────
        metaTitle: { type: String, default: '' },
        metaDescription: { type: String, default: '' },
        metaKeywords: { type: [String], default: [] },

        // ── Stats ─────────────────────────────────────────────────
        rating: { type: Number, default: 0, min: 0, max: 5 },
        reviewCount: { type: Number, default: 0 },
        totalSold: { type: Number, default: 0 },
        viewCount: { type: Number, default: 0 },
        wishlistCount: { type: Number, default: 0 },
    },
    {
        timestamps: true,
        toJSON: { virtuals: true },
    }
);

// ── Indexes for fast search ────────────────────────────────
// Text index for full-text search (name, description, brand, tags)
productSchema.index({ name: 'text', description: 'text', brand: 'text', tags: 'text', shortDescription: 'text' });
productSchema.index({ category: 1, status: 1 });
productSchema.index({ price: 1 });
productSchema.index({ rating: -1, totalSold: -1 });
productSchema.index({ tags: 1 });
productSchema.index({ colors: 1 });
productSchema.index({ brand: 1 });
productSchema.index({ isFeatured: 1, status: 1 });
productSchema.index({ isDeleted: 1, status: 1 });

// ── Discount price virtual ─────────────────────────────────
productSchema.virtual('discountedPrice').get(function () {
    if (this.discount > 0) {
        return this.price - (this.price * this.discount) / 100;
    }
    return this.price;
});

// ── soldCount virtual (alias for totalSold) ────────────────
productSchema.virtual('soldCount').get(function () {
    return this.totalSold || 0;
});

// ── Pre-save: Auto slug + SKU ──────────────────────────────
productSchema.pre('save', function (next) {
    if (this.isModified('name') && !this.slug) {
        this.slug = this.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') + '-' + Date.now();
    }
    if (!this.sku) {
        this.sku = 'SKU-' + Date.now() + '-' + Math.random().toString(36).substr(2, 5).toUpperCase();
    }
    next();
});

// ── Pre-find: Exclude deleted ──────────────────────────────
productSchema.pre('find', function (next) {
    if (!(this.getFilter() as any).isDeleted) {
        this.find({ isDeleted: { $ne: true } });
    }
    next();
});

export const Product = model('Product', productSchema);
