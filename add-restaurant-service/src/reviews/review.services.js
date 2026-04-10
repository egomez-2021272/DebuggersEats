import Review from './review.model.js';
import Restaurant from '../restaurants/restaurant.model.js';

export const createReviewRecord = async ({ restaurantId, userId, userName, rating, comment }) => {
    const restaurant = await Restaurant.findById(restaurantId);
    if (!restaurant) {
        const e = new Error('Restaurante no encontrado');
        e.statusCode = 404;
        throw e;
    }

    const review = new Review({ restaurantId, userId, userName, rating, comment });
    await review.save();
    return review;
};//createReviewRecord

export const getReviewsByRestaurantRecord = async (restaurantId) => {
    const restaurant = await Restaurant.findById(restaurantId);
    if (!restaurant) {
        const e = new Error('Restaurante no encontrado');
        e.statusCode = 404;
        throw e;
    }

    return Review.find({ restaurantId }).sort({ createdAt: -1 });
};//getReviewsByRestaurantRecord

export const updateReviewRecord = async ({ reviewId, userId, rating, comment }) => {
    const review = await Review.findById(reviewId);
    if (!review) {
        const e = new Error('Comentario no encontrado');
        e.statusCode = 404;
        throw e;
    }

    if (review.userId !== userId) {
        const e = new Error('No tienes permisos para editar este comentario');
        e.statusCode = 403;
        throw e;
    }

    if (rating !== undefined) review.rating = rating;
    if (comment !== undefined) review.comment = comment;
    await review.save();
    return review;
};//updateReviewRecord

export const deleteReviewRecord = async ({ reviewId, userId, userRole }) => {
    const review = await Review.findById(reviewId);
    if (!review) {
        const e = new Error('Comentario no encontrado');
        e.statusCode = 404;
        throw e;
    }

    //El propio usuario o un ADMIN puede eliminar el comentario
    if (review.userId !== userId && userRole !== 'ADMIN_ROLE') {
        const e = new Error('No tienes permisos para eliminar este comentario');
        e.statusCode = 403;
        throw e;
    }

    await Review.deleteOne({ _id: reviewId });
    return { deleted: true, reviewId };
};//deleteReviewRecord

//Respuesta del RES_ADMIN a un comentario
export const replyToReviewRecord = async ({ reviewId, userId, replyText }) => {
    const review = await Review.findById(reviewId).populate('restaurantId');
    if (!review) {
        const e = new Error('Comentario no encontrado');
        e.statusCode = 404;
        throw e;
    }

    //Solo el RES_ADMIN del restaurante puede responder
    if (review.restaurantId.createdBy.toString() !== userId) {
        const e = new Error('No tienes permisos para responder este comentario');
        e.statusCode = 403;
        throw e;
    }

    review.reply = replyText;
    review.repliedAt = new Date();
    review.repliedBy = userId;
    await review.save();
    return review;
};//replyToReviewRecord