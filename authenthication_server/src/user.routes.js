import {Router} from 'express';
import {createUser, activateAccount, login,updatePassword, forgotPassword, resetPasswordController } from './user.controller.js';
import {validateCreateUser, validateLogin, validateChangePassword, validateForgotPassword, validateResetPassword} from '../middlewares/user-validator.js'
import { validateJWT } from '../middlewares/validate-JWT.js';
import { validateRole } from '../middlewares/validate-role.js';
const router = Router();

router.get('/activate/:token', activateAccount);
router.post('/login', validateLogin, login);
router.post('/forgot-password', validateForgotPassword, forgotPassword);
router.post('/reset-password/:token', validateResetPassword, resetPasswordController);

router.post(
    '/',
    validateJWT,
    validateRole('ADMIN_ROLE'),
    validateCreateUser,
    createUser
);

router.put(
    '/change-password',
    validateJWT,
    validateChangePassword,
    updatePassword
);
export default router;