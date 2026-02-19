import mongoose from "mongoose";

export const dbConnection = async() => {
    try {
        mongoose.connection.on('error', () => {
            console.error(`Restaurante DB | Error de conexión detectado`);
            mongoose.disconnect();
        });

        mongoose.connection.on('connecting', () => {
            console.log(`Restaurante DB | Intentando conectar a MongoDB...`);
        });

        mongoose.connection.on('connected', () => {
            console.log(`Restaurante DB | Conexión establecida con éxito`);
        });

        mongoose.connection.on('reconnected', () => {
            console.log(`Restaurante DB | Conexión recuperada (Reconectado)`);
        });

        mongoose.connection.on('disconnected', () => {
            console.log(`Restaurante DB | Se ha perdido la conexión`);
        });


        await mongoose.connect(process.env.URI_MONGODB, {
            serverSelectionTimeoutMS: 5000, 
            maxPoolSize: 10,               
        });

    } catch (err) {
        console.error(`Restaurante App - Fallo crítico al iniciar DB: ${err.message}`);
        process.exit(1);
    }
};


const gracefulShutdown = async(signal) => {
    console.log(`Restaurante DB | Señal [${signal}] recibida. Cerrando base de datos...`);
    try {
        await mongoose.disconnect();
        console.log(`Restaurante DB | Conexión cerrada correctamente`);
        process.exit(0);
    } catch (err) {
        console.error(`Restaurante DB | Error durante el cierre: ${err.message}`);
        process.exit(1);
    }
};


process.on('SIGINT', () => gracefulShutdown('SIGINT'));   
process.on('SIGTERM', () => gracefulShutdown('SIGTERM')); 
process.on('SIGUSR2', () => gracefulShutdown('SIGUSR2')); 