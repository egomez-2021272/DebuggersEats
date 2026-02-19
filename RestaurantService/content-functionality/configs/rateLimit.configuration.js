import rateLimit from 'express-rate-limit';

export const requestLimit = rateLimit({
    windowMs: 15 * 60 * 1000, 
    max: 100, 
    
    handler: (req, res) => {
        // Log profesional para el administrador del sistema
        console.warn(`Alerta: Límite de peticiones excedido. IP: ${req.ip}, Ruta: ${req.path}`);
        
        res.status(429).json({
            success: false,
            message: 'Has realizado demasiadas solicitudes. Por seguridad, el sistema de gestión de restaurantes ha bloqueado tu IP temporalmente.',
            error: 'RATE_LIMIT_EXCEEDED',
            retryAfterSeconds: Math.ceil((req.rateLimit.resetTime - Date.now()) / 1000)
        });
    },
    standardHeaders: true, 
    legacyHeaders: false,
});