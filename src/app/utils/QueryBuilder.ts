// QueryBuilder - Search, Filter, Sort, Paginate helper
import { FilterQuery, Query } from 'mongoose';

class QueryBuilder<T> {
    public modelQuery: Query<T[], T>;
    public query: Record<string, unknown>;

    constructor(modelQuery: Query<T[], T>, query: Record<string, unknown>) {
        this.modelQuery = modelQuery;
        this.query = query;
    }

    // Text search (name, description, tags, brand)
    search(searchableFields: string[]) {
        const searchTerm = this.query?.searchTerm;
        if (searchTerm) {
            this.modelQuery = this.modelQuery.find({
                $or: searchableFields.map((field) => ({
                    [field]: { $regex: searchTerm, $options: 'i' },
                })) as FilterQuery<T>[],
            });
        }
        return this;
    }

    // Filter by any field (category, brand, status, etc.)
    filter() {
        const queryObj = { ...this.query };
        const excludeFields = ['searchTerm', 'sort', 'limit', 'page', 'fields'];
        excludeFields.forEach((el) => delete queryObj[el]);

        // Price range filter
        if (queryObj.minPrice || queryObj.maxPrice) {
            (queryObj as any).price = {};
            if (queryObj.minPrice) {
                (queryObj as any).price.$gte = Number(queryObj.minPrice);
                delete queryObj.minPrice;
            }
            if (queryObj.maxPrice) {
                (queryObj as any).price.$lte = Number(queryObj.maxPrice);
                delete queryObj.maxPrice;
            }
        }

        this.modelQuery = this.modelQuery.find(queryObj as FilterQuery<T>);
        return this;
    }

    // Sort results
    sort() {
        const sort = (this.query?.sort as string)?.split(',')?.join(' ') || '-createdAt';
        this.modelQuery = this.modelQuery.sort(sort as string);
        return this;
    }

    // Paginate
    paginate() {
        const page = Number(this.query?.page) || 1;
        const limit = Number(this.query?.limit) || 10;
        const skip = (page - 1) * limit;
        this.modelQuery = this.modelQuery.skip(skip).limit(limit);
        return this;
    }

    // Select specific fields
    fields() {
        const fields = (this.query?.fields as string)?.split(',')?.join(' ') || '-__v';
        (this.modelQuery as any) = this.modelQuery.select(fields as any);
        return this;
    }

    // Get total count for pagination meta
    async countTotal() {
        const totalQueries = this.modelQuery.getFilter();
        const total = await this.modelQuery.model.countDocuments(totalQueries);
        const page = Number(this.query?.page) || 1;
        const limit = Number(this.query?.limit) || 10;
        const totalPages = Math.ceil(total / limit);
        return { page, limit, total, totalPages };
    }
}

export default QueryBuilder;
