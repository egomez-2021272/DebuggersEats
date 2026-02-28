import { Router } from 'express';
import { createMenu, getMenus, getMenuById, updateMenu, deleteMenu, getMenusByRestaurant, uploadMenuPhoto, deleteMenuPhoto } from './menu.controller.js';

import { validateJWT } from '../../middlewares/validate-jwt.js'
import { validateRole } from '../../middlewares/validate-role.js';
//import { getMenuByIdService } from './menu.services.js';
import { uploadMenuPhoto as uploadMenuPhotoMiddleware, handleUploadError } from '../../helpers/file-upload.js';


const router = Router();

router.get('/', getMenus);
router.get('/restaurant/:restaurantId', getMenusByRestaurant)
router.get('/:id', getMenuById);

// La foto es opcional al crear: si viene se sube, si no viene se crea sin foto
router.post(
    '/',
    validateJWT,
    validateRole('RES_ADMIN_ROLE'),
    uploadMenuPhotoMiddleware.single('photo'),
    handleUploadError,
    createMenu
);

router.put(
    '/:id',
    validateJWT,
    validateRole('RES_ADMIN_ROLE'),
    updateMenu
);

router.delete(
    '/:id',
    validateJWT,
    validateRole('RES_ADMIN_ROLE'),
    deleteMenu
);

// Subir o reemplazar foto de un plato ya existente
router.post(
    '/:id/photo',
    validateJWT,
    validateRole('RES_ADMIN_ROLE'),
    uploadMenuPhotoMiddleware.single('photo'),
    handleUploadError,
    uploadMenuPhoto
);

// Eliminar foto del plato
router.delete(
    '/:id/photo',
    validateJWT,
    validateRole('RES_ADMIN_ROLE'),
    deleteMenuPhoto
);

export default router;