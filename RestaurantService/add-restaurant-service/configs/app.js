'use strict';

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';

import { corsOptions } from './cors.configuration.js';
import { helmetOptions } from './helmet.configuration.js';
import { dbConnection } from './db.configuration.js';
import restaurantRoutes from '../src/restaurant.routes.js';

const BASE_PATH = '/add-restaurant/v1';

const routes = (app) => {

    app.use(`${BASE_PATH}/restaurants`, restaurantRoutes);

    app.get(`${BASE_PATH}/health`, (req, res) => {
        res.status(200).json({
            status: 'Healthy',
            timeStamp: new Date().toISOString(),
            service: 'Add Restaurant Service'
        });
    });

    app.use((req, res) => {
        res.status(404).json({
            success: false,
            message: 'Endpoint no encontrado'
        });
    });
};

const middlewares = (app) => {
    app.use(cors(corsOptions));
    app.use(helmet(helmetOptions));
    app.use(morgan('dev'));
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));
};

export const initServer = async () => {

    const app = express();
    const PORT = process.env.PORT || 3008;

    app.set('trust proxy', 1);

    try {

        middlewares(app);

        await dbConnection();

        routes(app);

        app.listen(PORT, () => {
            console.log(`Add Restaurant Service running on port ${PORT}`);
            console.log(`Health check endpoint: http://localhost:${PORT}${BASE_PATH}/health`);
        });

    } catch (err) {
        console.error(`Add Restaurant Service - Error al iniciar el servidor: ${err.message}`);
        process.exit(1);
    }
};
