import { Schema, model } from 'mongoose';

const reviewSchema = new Schema(
    {
        product: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
        user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        rating: { type: Number, required: true, min: 1, max: 5 },
        title: { type: String, maxlength: 100, default: '' },
        comment: { type: String, required: true, maxlength: 1000 },
        images: [{ type: String }],
        isVerifiedPurchase: { type: Boolean, default: false },
        isApproved: { type: Boolean, default: true },
        helpfulVotes: { type: Number, default: 0 },
    },
    { timestamps: true, toJSON: { virtuals: true } }
);

reviewSchema.index({ product: 1, user: 1 }, { unique: true }); // one review per user per product
reviewSchema.index({ product: 1, isApproved: 1 });

// Auto-update product rating after save/delete
reviewSchema.post('save', async function () {
    const Product = (await import('../product/product.model')).Product;
    const stats = await (this.constructor as any).aggregate([
        { $match: { product: this.product, isApproved: true } },
        { $group: { _id: '$product', avgRating: { $avg: '$rating' }, count: { $sum: 1 } } },
    ]);
    if (stats.length > 0) {
        await Product.findByIdAndUpdate(this.product, {
            rating: Math.round(stats[0].avgRating * 10) / 10,
            reviewCount: stats[0].count,
        });
    }
});

export const Review = model('Review', reviewSchema);
