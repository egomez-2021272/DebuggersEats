import jwt from 'jsonwebtoken';
import Reservation from './reservation.model.js';
import { getRestaurantByName } from '../restaurants/restaurant.services.js';

const generateConfirmationToken = (reservationId) => {
    const hoursToExpire = parseInt(process.env.RESERVATION_TOKEN_EXPIRES_HOURS || '24');
    const secret = process.env.JWT_RESERVATION_SECRET || process.env.JWT_SECRET;

    return jwt.sign(
        {
            reservationId: reservationId.toString(),
            purpose: 'RESERVATION_CONFIRM'
        },
        secret,
        { expiresIn: `${hoursToExpire}h`, issuer: process.env.JWT_ISSUER, audience: process.env.JWT_AUDIENCE }
    );
};//generar token


const verifyConfirmationToken = (token) => {
    const secret = process.env.JWT_RESERVATION_SECRET || process.env.JWT_SECRET;

    try {
        const decoded = jwt.verify(token, secret, { issuer: process.env.JWT_ISSUER, audience: process.env.JWT_AUDIENCE });
        if (decoded.purpose !== 'RESERVATION_CONFIRM') {
            const e = new Error('Token no válido para esta operación');
            e.statusCode = 400;
            throw e;
        }

        return decoded;

    } catch (err) {
        if (err.statusCode) throw err;
        if (err.name === 'TokenExpiredError') {
            const e = new Error('El token de confirmación ha expirado. Solicita una nueva reservación.');
            e.statusCode = 410;
            throw e;
        }

        const e = new Error('Token de confirmación inválido o malformado');
        e.statusCode = 401;
        throw e;
    }
};


export const createReservationRecord = async ({ reservationData, userId }) => {
    const restaurant = await getRestaurantByName(reservationData.restaurantName);

    if (!restaurant) {
        const e = new Error(`El restaurante "${reservationData.restaurantName}" no existe o no está activo.`);
        e.statusCode = 404;
        throw e;
    }// validar si existe el restaurante

    const reservationDateH = new Date(reservationData.reservationDate);
    reservationDateH.setHours(0, 0, 0, 0);//Quitar hora en el formato de fecha

    const reservationActive = await Reservation.find({
        restaurantName: reservationData.restaurantName,
        reservationDate: reservationDateH,
        reservationHour: reservationData.reservationHour,
        status: { $in: ['PENDIENTE', 'CONFIRMADA'] }
    });

    const personasOcupadas = reservationActive.reduce(
        (sum, r) => sum + r.peopleNumber, 0
    );

    const espacioDisponible = restaurant.capacity - personasOcupadas;

    if (reservationData.peopleNumber > espacioDisponible) {
        const e = new Error(`No hay espacio. Disponible ${espacioDisponible} personas de ${restaurant.capacity}`);
        e.statusCode = 400;
        throw e;
    }//Que el número de personas no exceda la capacidad del restaurante

    const activeCount = await Reservation.countDocuments({
        userId,
        status: { $in: ['PENDIENTE', 'CONFIRMADA'] }
    });

    if (activeCount >= 3) {
        const e = new Error('No se puede tener más de 3 reservaciones activas al mismo tiempo,');
        e.statusCode = 409;
        throw e;
    }//no se puede tener más de 3 cuentas activas

    

    const duplicate = await Reservation.findOne({
        restaurantName: reservationData.restaurantName,
        reservationDate: reservationDateH,
        reservationHour: reservationData.reservationHour,
        status: { $in: ['PENDIENTE', 'CONFIRMADA'] }
    });

    if (duplicate) {
        const e = new Error(`Ya existe una reservación activa en "${reservationData.restaurantName}" para esa fecha y hora`);
        e.statusCode = 409;
        throw e;
    }

    const reservation = new Reservation({
        ...reservationData,
        reservationDate: reservationDateH,
        userId,
        status: 'PENDIENTE'
    });

    await reservation.save();

    //GENERAR EL TOKEN
    const hoursToExpire = parseInt(process.env.RESERVATION_TOKEN_EXPIRES_HOURS || '24');
    const confirmationToken = generateConfirmationToken(reservation._id);
    const tokenExpiresAt = new Date(Date.now() + hoursToExpire * 60 * 60 * 1000);

    //CONFIRMAR TOKEN
    reservation.confirmationToken = confirmationToken;
    await reservation.save();

    return {
        reservation,
        confirmationToken,
        tokenExpiresAt,
        message: `Reservación creada. Usa el token para CONFIRMAR o CANCELAR, expira en ${hoursToExpire} horas.`
    };
};

export const tokenAction = async ({ token, action }) => {
    const decoded = verifyConfirmationToken(token);
    const reservation = await Reservation
        .findById(decoded.reservationId)
        .select('+confirmationToken');

    if (!reservation) {
        const e = new Error('La reservación asociada con el token no fue encontrada');
        e.statusCode = 404;
        throw e;
    }//Si existe el token

    if (reservation.confirmationToken !== token) {
        const e = new Error('Token inválido');
        e.statusCode = 401;
        throw e;
    }//Validar si es un token valido

    if (reservation.status !== 'PENDIENTE') {
        const e = new Error(`El token solo procesa reservaciones pendientes. Estado Actual: ${reservation.status}`);
        e.statusCode = 409;
        throw e;
    }//Solo una reservacion pendiente

    reservation.status = action === 'CONFIRMAR' ? 'CONFIRMADA' : 'CANCELADA';

    reservation.confirmationToken = undefined;

    await reservation.save();

    return reservation;
}//tokenActivacion

const finalizeExpiredReservations = async (userId) => {
    const now = new Date();
    await Reservation.updateMany(
        {
            userId,
            status: { $in: ['PENDIENTE', 'CONFIRMADA'] },
            reservationDate: { $lt: now }
        },
        { $set: { status: 'FINALIZADA' } }
    );
};

export const getReservationRecord = async (userId, filters = {}) => {
    await finalizeExpiredReservations(userId);

    const query = { userId };
    if (filters.status) query.status = filters.status;

    return Reservation.find(query).sort({
        reservationDate: -1, reservationHour: -1
    })
};

export const updateReservationRecord = async ({ reservationId, userId, data }) => {
    const { status, confirmationToken, userId: _uid, ...safeData } = data;

    const reservation = await Reservation.findOne({ _id: reservationId, userId });

    if (!reservation) {
        const e = new Error('Reservación no encontrada o no tienes permisos para editarla');
        e.statusCode = 404;
        throw e;
    }

    if (!['PENDIENTE', 'CONFIRMADA'].includes(reservation.status)) {
        const e = new Error(`No puedes editar una reservación con estado "${reservation.status}"`);
        e.statusCode = 409;
        throw e;
    }//No se puede editar reservaciones canceladas

    const newRestaurantName = safeData.restaurantName || reservation.restaurantName;
    const newDate = safeData.reservationDate ? new Date(safeData.reservationDate) : reservation.reservationDate;
    const newHour = safeData.reservationHour || reservation.reservationHour;
    const newPeopleNumber = safeData.peopleNumber || reservation.peopleNumber;

    if (safeData.restaurantName || safeData.peopleNumber) {
        const restaurant = await getRestaurantByName(newRestaurantName);
        if (!restaurant) {
            const e = new Error(`El restaurante "${newRestaurantName}" no existe o no está activo`);
            e.statusCode = 404;
            throw e;
        }//Buscar restaurante si existe
        if (newPeopleNumber > restaurant.capacity) {
            const e = new Error(
                `El número de personas (${newPeopleNumber}) excede la capacidad del restaurante (${restaurant.capacity})`
            );
            e.statusCode = 400;
            throw e;
        }//validar que el numero de persona no sea mayor que la capacidad
    }

    if (safeData.reservationDate || safeData.reservationHour || safeData.restaurantName) {
        const normalizedDate = new Date(newDate);
        normalizedDate.setHours(0, 0, 0, 0);

        const duplicate = await Reservation.findOne({
            _id: { $ne: reservationId },
            restaurantName: newRestaurantName,
            reservationDate: normalizedDate,
            reservationHour: newHour,
            status: { $in: ['PENDIENTE', 'CONFIRMADA'] }
        });

        if (duplicate) {
            const e = new Error(
                `Ya existe una reservación activa en "${newRestaurantName}" para esa fecha y hora`
            );
            e.statusCode = 409;
            throw e;
        }//Evitar reservaciones duplicadas

        if (safeData.reservationDate) safeData.reservationDate = normalizedDate;
    }//if

    Object.assign(reservation, safeData);
    await reservation.save();

    return reservation;
};//update

export const deleteReservationRecord = async ({ reservationId, userId }) => {
    const reservation = await Reservation.findOne({ _id: reservationId, userId });

    if (!reservation) {
        const e = new Error('Reservación no encontrada o no tienes permisos para eliminarla');
        e.statusCode = 404;
        throw e;
    }

    if (reservation.status === 'CONFIRMADA') {
        const e = new Error('No puedes eliminar una reservación CONFIRMADA. Primero cancélala.');
        e.statusCode = 409;
        throw e;
    }

    await Reservation.deleteOne({ _id: reservationId });

    return { deleted: true, reservationId };
};//Delete