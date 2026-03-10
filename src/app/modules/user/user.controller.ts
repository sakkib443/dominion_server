import { Request, Response } from 'express';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import UserService from './user.service';

const UserController = {
    // GET /api/users (admin)
    getAllUsers: catchAsync(async (req: Request, res: Response) => {
        const { users, meta } = await UserService.getAllUsers(req.query as Record<string, unknown>);
        sendResponse(res, { statusCode: 200, success: true, message: 'Users fetched successfully', data: users, meta });
    }),

    // GET /api/users/me
    getMyProfile: catchAsync(async (req: Request, res: Response) => {
        const user = await UserService.getMyProfile(req.user!.userId);
        sendResponse(res, { statusCode: 200, success: true, message: 'Profile fetched successfully', data: user });
    }),

    // PATCH /api/users/me
    updateMyProfile: catchAsync(async (req: Request, res: Response) => {
        const user = await UserService.updateMyProfile(req.user!.userId, req.body);
        sendResponse(res, { statusCode: 200, success: true, message: 'Profile updated successfully', data: user });
    }),

    // GET /api/users/:id (admin)
    getUserById: catchAsync(async (req: Request, res: Response) => {
        const user = await UserService.getUserById(req.params.id);
        sendResponse(res, { statusCode: 200, success: true, message: 'User fetched successfully', data: user });
    }),

    // POST /api/users/addresses
    addShippingAddress: catchAsync(async (req: Request, res: Response) => {
        const addresses = await UserService.addShippingAddress(req.user!.userId, req.body);
        sendResponse(res, { statusCode: 201, success: true, message: 'Address added successfully', data: addresses });
    }),

    // PATCH /api/users/addresses/:addressId
    updateShippingAddress: catchAsync(async (req: Request, res: Response) => {
        const addresses = await UserService.updateShippingAddress(req.user!.userId, req.params.addressId, req.body);
        sendResponse(res, { statusCode: 200, success: true, message: 'Address updated successfully', data: addresses });
    }),

    // DELETE /api/users/addresses/:addressId
    deleteShippingAddress: catchAsync(async (req: Request, res: Response) => {
        const addresses = await UserService.deleteShippingAddress(req.user!.userId, req.params.addressId);
        sendResponse(res, { statusCode: 200, success: true, message: 'Address deleted successfully', data: addresses });
    }),

    // POST /api/users/wishlist/:productId
    toggleWishlist: catchAsync(async (req: Request, res: Response) => {
        const result = await UserService.toggleWishlist(req.user!.userId, req.params.productId);
        sendResponse(res, { statusCode: 200, success: true, message: result.added ? 'Added to wishlist' : 'Removed from wishlist', data: result });
    }),

    // PATCH /api/users/:id/status (admin)
    updateUserStatus: catchAsync(async (req: Request, res: Response) => {
        const user = await UserService.updateUserStatus(req.params.id, req.body.status);
        sendResponse(res, { statusCode: 200, success: true, message: 'User status updated', data: user });
    }),

    // DELETE /api/users/:id (admin)
    deleteUser: catchAsync(async (req: Request, res: Response) => {
        await UserService.deleteUser(req.params.id);
        sendResponse(res, { statusCode: 200, success: true, message: 'User deleted successfully' });
    }),
};

export default UserController;
