import AppError from '../errors/AppError.js';
import asyncHandler from '../errors/asyncHandler.js';

class AccessMiddleware {
  constructor(tokenService) {
    this.tokenService = tokenService;
  }

  protect = asyncHandler(async (req, res, next) => {
    const token = req.headers.authorization && req.headers.authorization.startsWith('Bearer ')
      ? req.headers.authorization.split(' ')[1]
      : null;

    if (!token) {
      throw new AppError('You are not logged in! Please log in to get access.', 401);
    }

    try {
      const decoded = await this.tokenService.verifyToken(token);
      
      // Branch check
      const staffBranch = req.body.branch || req.params.branch || req.query.branch;
      if (staffBranch && decoded.branch !== staffBranch) {
        throw new AppError('Branch mismatch. Access denied.', 403);
      }

      req.user = decoded;
      next();
    } catch (error) {
      console.error(error);
      return res.status(400).json({ message: 'Invalid token, please login again' });
    }
  });

  restrictTo(...roles) {
    return (req, res, next) => {
      if (!roles.includes(req.user.role)) {
        throw new AppError('You do not have permission to perform this action', 403);
      }
      next();
    };
  }
}

export default AccessMiddleware;