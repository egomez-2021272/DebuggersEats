import { Router } from 'express';
import { createRestaurant, deleteRestaurant, getRestaurantById, updateRestaurant, uploadRestaurantPhoto, deleteRestaurantPhoto } from './restaurant.controller.js';
import { validateCreateRestaurant } from '../../middlewares/restaurant-validator.js'
import { validateRole } from '../../middlewares/validate-role.js';
import { validateJWT } from '../../middlewares/validate-jwt.js';
import { getAllRestaurants } from './restaurant.controller.js';
import { uploadRestaurantPhoto as uploadRestaurantPhotoMiddleware, handleUploadError } from '../../helpers/file-upload.js';



const router = Router();

// La foto es opcional al crear: si viene se sube, si no viene se crea sin foto
router.post(
    '/',
    uploadRestaurantPhotoMiddleware.single('photo'),
    handleUploadError,
    validateJWT,
    validateRole('ADMIN_ROLE'),
    validateCreateRestaurant,
    createRestaurant

);

router.get('/',
    validateJWT,
    validateRole('ADMIN_ROLE'),
    getAllRestaurants
);

// Subir o reemplazar foto de un restaurante ya existente
router.post(
    '/:id/photo',
    uploadRestaurantPhotoMiddleware.single('photo'),
    handleUploadError,
    validateJWT,
    validateRole('ADMIN_ROLE'),
    uploadRestaurantPhoto
);

router.get('/:id',
    getRestaurantById
);

router.patch(
    '/:id',
    validateJWT,
    validateRole('ADMIN_ROLE'),
    updateRestaurant
);

router.delete(
    '/:id',
    validateJWT,
    validateRole('ADMIN_ROLE'),
    deleteRestaurant
)

// Eliminar foto del restaurante
router.delete(
    '/:id/photo',
    validateJWT,
    validateRole('ADMIN_ROLE'),
    deleteRestaurantPhoto
);


export default router;
