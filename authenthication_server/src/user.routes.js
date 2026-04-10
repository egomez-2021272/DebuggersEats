import { Router } from 'express';
import { createUser, registerUser, activateAccount, login, updatePassword, forgotPassword, resetPasswordController, updateProfile, getUsers, getUserById, toggleUserStatus, deleteUser } from './user.controller.js';
import { validateCreateUser, validateRegisterUser, validateLogin, validateChangePassword, validateForgotPassword, validateResetPassword, validateUpdateProfile } from '../middlewares/user-validator.js'
import { validateJWT } from '../middlewares/validate-JWT.js';
import { validateRole } from '../middlewares/validate-role.js';
const router = Router();

//publicas
router.get('/activate/:token', activateAccount);
router.post('/login', validateLogin, login);
router.post('/forgot-password', validateForgotPassword, forgotPassword);
router.post('/reset-password/:token', validateResetPassword, resetPasswordController);

//Auto-registro de clientes
router.post('/register', validateRegisterUser, registerUser);

//creación de usuarios por administrador
router.post(
    '/',
    validateJWT,
    validateRole('ADMIN_ROLE'),
    validateCreateUser,
    createUser
);

//cambio de contraseña
router.put(
    '/change-password',
    validateJWT,
    validateChangePassword,
    updatePassword
);

//Edición de perfil propio
router.put(
    '/profile',
    validateJWT,
    validateUpdateProfile,
    updateProfile
);

//Gestión completa de usuarios
router.get(
    '/users',
    validateJWT,
    validateRole('ADMIN_ROLE'),
    getUsers
);

router.get(
    '/users/:id',
    validateJWT,
    validateRole('ADMIN_ROLE'),
    getUserById
);

router.patch(
    '/users/:id/status',
    validateJWT,
    validateRole('ADMIN_ROLE'),
    toggleUserStatus
);

router.delete(
    '/users/:id',
    validateJWT,
    validateRole('ADMIN_ROLE'),
    deleteUser
);
export default router;