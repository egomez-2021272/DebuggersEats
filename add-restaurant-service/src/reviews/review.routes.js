import { Router } from 'express';
import { createReview, getReviewsByRestaurant, updateReview, deleteReview, replyToReview } from './review.controller.js';
import { validateJWT } from '../../middlewares/validate-jwt.js';
import { validateRole } from '../../middlewares/validate-role.js';

const router = Router();

router.use(validateJWT);

//ver comentarios de un restaurante — cualquier usuario
router.get(
    '/restaurant/:restaurantId',
    getReviewsByRestaurant
);

//publicar comentario — cualquier usuario autenticado
router.post(
    '/restaurant/:restaurantId',
    createReview
);

//editar propio comentario
router.patch(
    '/:id',
    updateReview
);

//eliminar: propio usuario o ADMIN
router.delete(
    '/:id',
    deleteReview
);

//Respuesta del RES_ADMIN a un comentario
router.post(
    '/:id/reply',
    validateRole('RES_ADMIN_ROLE'),
    replyToReview
);

export default router;
//Estos fueron otros 20 pesos