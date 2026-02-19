export const corsOptions = {
    origin: true, // Esto permite que el servidor responda a cualquier origen
    credentials: true, // Corregido: antes decía 'credential'
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'], 
    allowedHeaders: ['Content-Type', 'Authorization']
};