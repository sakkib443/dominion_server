import { User } from './user.model';
import AppError from '../../utils/AppError';
import QueryBuilder from '../../utils/QueryBuilder';

const UserService = {
    // Get all users (admin)
    async getAllUsers(query: Record<string, unknown>) {
        const userQuery = new QueryBuilder(
            User.find().select('-password'),
            query
        )
            .search(['firstName', 'lastName', 'email', 'phone'])
            .filter()
            .sort()
            .paginate();

        const users = await userQuery.modelQuery;
        const meta = await userQuery.countTotal();
        return { users, meta };
    },

    // Get single user
    async getUserById(id: string) {
        const user = await User.findById(id);
        if (!user) throw new AppError(404, 'User not found');
        return user;
    },

    // Get my profile
    async getMyProfile(userId: string) {
        const user = await User.findById(userId);
        if (!user) throw new AppError(404, 'User not found');
        return user;
    },

    // Update my profile
    async updateMyProfile(userId: string, payload: Partial<{ firstName: string; lastName: string; phone: string; avatar: string }>) {
        const user = await User.findByIdAndUpdate(userId, payload, { new: true, runValidators: true });
        if (!user) throw new AppError(404, 'User not found');
        return user;
    },

    // Add shipping address
    async addShippingAddress(userId: string, address: any) {
        const user = await User.findById(userId);
        if (!user) throw new AppError(404, 'User not found');

        // If new address is default, remove default from others
        if (address.isDefault) {
            user.shippingAddresses.forEach((addr) => (addr.isDefault = false));
        }

        user.shippingAddresses.push(address);
        await user.save();
        return user.shippingAddresses;
    },

    // Update shipping address
    async updateShippingAddress(userId: string, addressId: string, payload: any) {
        const user = await User.findById(userId);
        if (!user) throw new AppError(404, 'User not found');

        const address = user.shippingAddresses.id(addressId);
        if (!address) throw new AppError(404, 'Address not found');

        if (payload.isDefault) {
            user.shippingAddresses.forEach((addr) => (addr.isDefault = false));
        }

        Object.assign(address, payload);
        await user.save();
        return user.shippingAddresses;
    },

    // Delete shipping address
    async deleteShippingAddress(userId: string, addressId: string) {
        const user = await User.findById(userId);
        if (!user) throw new AppError(404, 'User not found');
        user.shippingAddresses = user.shippingAddresses.filter(
            (addr) => addr._id?.toString() !== addressId
        );
        await user.save();
        return user.shippingAddresses;
    },

    // Add to wishlist
    async toggleWishlist(userId: string, productId: string) {
        const user = await User.findById(userId);
        if (!user) throw new AppError(404, 'User not found');

        const index = user.wishlist.indexOf(productId);
        if (index === -1) {
            user.wishlist.push(productId);
        } else {
            user.wishlist.splice(index, 1);
        }
        await user.save();
        return { wishlist: user.wishlist, added: index === -1 };
    },

    // Admin: update user status
    async updateUserStatus(id: string, status: 'active' | 'blocked' | 'pending') {
        const user = await User.findByIdAndUpdate(id, { status }, { new: true });
        if (!user) throw new AppError(404, 'User not found');
        return user;
    },

    // Admin: delete user (soft)
    async deleteUser(id: string) {
        const user = await User.findByIdAndUpdate(id, { isDeleted: true }, { new: true });
        if (!user) throw new AppError(404, 'User not found');
        return user;
    },
};

export default UserService;
