import Reservation from './reservation.model.js';
import { createReservationRecord, getReservationRecord, updateReservationRecord, deleteReservationRecord, tokenAction } from "./reservation.service.js";
import { getRestaurantByName } from "../restaurants/restaurant.services.js";

export const createReservation = async (req, res) => {
    try {
        const result = await createReservationRecord({
            reservationData: req.body,
            userId: req.user.id
        });

        res.status(201).json({
            success: true,
            message: result.message,
            data: result.reservation,
            confirmationToken: result.confirmationToken,
            tokenExpiresAt: result.tokenExpiresAt
        });
    } catch(e) {
        res.status(e.statusCode || 500).json({
            success: false,
            message: e.message || 'Error al crear la reservación'
        })
    }//try-catch
}//CrearReservacion

export const confirmOrCancelReservation = async (req, res) => {
    try {
        const { token, action } = req.body;

        const reservation = await tokenAction({ token, action });

        const actionLabel = action === 'CONFIRMAR' ? 'confirmada' : 'cancelada';

        res.status(200).json({
            success: true,
            message: `Reservación ${actionLabel} exitosamente`,
            data: reservation
        });
    } catch (e) {
        res.status(e.statusCode || 500).json({
            success: false,
            message: e.message || 'Error al procesar la acción'
        });
    }
};

export const getReservation = async (req, res) => {
    try {
        const filters = {};
        const reservations = await getReservationRecord(req.user.id, filters);
        res.status(200).json({
            success: true,
            total: reservations.length,
            data: reservations
        });
    } catch (e) {
        res.status(e.statusCode || 500).json({
            success: false,
            message: e.message || 'Error al obtener las reservaciones'
        });
    }//try-catcjh
}//getRervation


export const updateReservation = async (req, res) => {
    try {
        const reservation = await updateReservationRecord({
            reservationId: req.params.id,
            userId: req.user.id,
            data: req.body
        });

        res.status(200).json({
            success: true,
            message: 'Reservación actualizada exitosamente',
            data: reservation
        });
    } catch (e) {
        res.status(e.statusCode || 500).json({
            success: false,
            message: e.message || 'Error al actualizar la reservación'
        });
    }//try-catch
}//update

export const deleteReservation = async (req, res) => {
    try {
        const result = await deleteReservationRecord({
            reservationId: req.params.id,
            userId: req.user.id
        });

        res.status(200).json({
            success: true,
            message: 'Reservación eliminada exitosamente',
            data: result
        });
    } catch (e) {
        res.status(e.statusCode || 500).json({
            success: false,
            message: e.message || 'Error al eliminar la reservación'
        });
    }
};

export const checkDisponibilidad = async (req, res) => {
    const { restaurantName } = req.params;
    const { date, hour } = req.query;

    try {
        const restaurant = await getRestaurantByName(restaurantName);
        if (!restaurant) {
            return res.status(404).json({ success: false, message: 'Restaurante no encontrado' });
        }

        const reservationDate = new Date(date);
        reservationDate.setHours(0, 0, 0, 0);

        const reservaciones = await Reservation.find({
            restaurantName,
            reservationDate,
            reservationHour: hour,
            status: { $in: ['PENDIENTE', 'CONFIRMADA'] }
        });

        const ocupado = reservaciones.reduce((sum, r) => sum + r.peopleNumber, 0);
        const disponible = restaurant.capacity - ocupado;

        res.json({
            success: true,
            data: {
                restaurante: restaurantName,
                fecha: date,
                hora: hour,
                capacidadTotal: restaurant.capacity,
                personasOcupadas: ocupado,
                espacioDisponible: disponible,
                disponible: disponible > 0,
                mensaje: disponible === 0
                ? 'No hay espacio disponible para esa fecha y hora': disponible <= 3
                ? `¡Quedan solo ${disponible} espacios!`: `Hay ${disponible} espacios disponibles`
            }
        });
    } catch (e) {
        res.status(500).json({ success: false, message: e.message });
    }
};

export const getReservationsByRestaurant = async (req, res) => {
    const { restaurantName } = req.params;
    const { status, date } = req.query;

    try {
        const query = { restaurantName };
        if (status) query.status = status;
        if (date) {
            const d = new Date(date);
            d.setHours(0, 0, 0, 0);
            query.reservationDate = d;
        }

        const reservations = await Reservation.find(query)
            .sort({ reservationDate: 1, reservationHour: 1 });

        res.json({
            success: true,
            total: reservations.length,
            data: reservations
        });
    } catch (e) {
        res.status(500).json({ success: false, message: e.message });
    }
};