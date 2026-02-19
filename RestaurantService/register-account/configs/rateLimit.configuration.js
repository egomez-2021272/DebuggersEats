import rateLimit from 'express-rate-limit';

export const requestLimit = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 100, // Limite de 100 solicitudes por IP
    
    handler: (req, res)=>{
        console.log(`Peticiones excedidasde desde IP: ${req.ip}, Endpoint: ${req.path}`);
        res.status(429).json({
            success: false,
            message: 'Demasiadas solicitudes desde esta IP, por favor intente nuevamente después de 15 minutos.',
            error: 'RATE_LIMIT_EXCEEDED',
            retryAfter: Math.round(req.rateLimit.resetTime - Date.now()) / 1000 // Tiempo restante en segundos
        });
    }
});