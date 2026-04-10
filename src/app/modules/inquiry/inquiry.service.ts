import { Inquiry } from './inquiry.model';

const InquiryService = {
    create: async (data: any) => {
        const inquiry = await Inquiry.create(data);
        return inquiry;
    },

    getAll: async (query: Record<string, unknown>) => {
        const page = Number(query.page) || 1;
        const limit = Number(query.limit) || 20;
        const skip = (page - 1) * limit;
        const filter: any = {};
        if (query.status) filter.status = query.status;
        if (query.product) filter.product = query.product;

        const [inquiries, total] = await Promise.all([
            Inquiry.find(filter)
                .populate('product', 'name slug thumbnail')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit),
            Inquiry.countDocuments(filter),
        ]);

        return {
            inquiries,
            meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
        };
    },

    getByProduct: async (productId: string) => {
        const inquiries = await Inquiry.find({ product: productId })
            .sort({ createdAt: -1 })
            .limit(50);
        return inquiries;
    },

    updateStatus: async (id: string, data: { status: string; adminReply?: string }) => {
        const inquiry = await Inquiry.findByIdAndUpdate(id, data, { new: true });
        if (!inquiry) throw new Error('Inquiry not found');
        return inquiry;
    },

    delete: async (id: string) => {
        const inquiry = await Inquiry.findByIdAndDelete(id);
        if (!inquiry) throw new Error('Inquiry not found');
        return inquiry;
    },
};

export default InquiryService;
