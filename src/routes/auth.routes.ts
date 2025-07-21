import { Router } from 'express';
import { authController } from '../controllers/auth.controller';
import { validateRequest } from '../middleware/validateRequest';
import { authRateLimiter } from '../middleware/rateLimiter';
import { authenticateToken } from '../middleware/auth';
import { 
  registerSchema, 
  loginSchema, 
  refreshTokenSchema,
  forgotPasswordSchema,
  resetPasswordSchema
} from '../utils/validation/auth.validation';

const router = Router();

// Public routes
router.post(
  '/register',
  authRateLimiter,
  validateRequest(registerSchema),
  authController.register
);

router.post(
  '/login',
  authRateLimiter,
  validateRequest(loginSchema),
  authController.login
);

router.post(
  '/refresh-token',
  validateRequest(refreshTokenSchema),
  authController.refreshToken
);

router.post(
  '/forgot-password',
  authRateLimiter,
  validateRequest(forgotPasswordSchema),
  authController.forgotPassword
);

router.post(
  '/reset-password',
  authRateLimiter,
  validateRequest(resetPasswordSchema),
  authController.resetPassword
);

// Protected routes
router.post(
  '/logout',
  authenticateToken,
  authController.logout
);

router.get(
  '/me',
  authenticateToken,
  authController.getCurrentUser
);

router.put(
  '/change-password',
  authenticateToken,
  authController.changePassword
);

export default router; 