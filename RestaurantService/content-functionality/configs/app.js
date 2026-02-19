'use strict';

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import restaurantRoutes from '../src/restaurant/restaurant.routes.js';
import { errorHandler } from '../middlewares/handle-errors.js';

const BASE_PATH = '/restaurantManager/v1';

const routes = (app) => {
    app.use(`${BASE_PATH}/content`, restaurantRoutes);
    
    app.get(`${BASE_PATH}/health`, (req, res) => {
        res.status(200).json({ status: 'Healthy', service: 'Restaurant API' });
    });
};

const middlewares = (app) => {
    app.use(express.json({ limit: '10mb' }));
    app.use(express.urlencoded({ extended: false }));
    app.use(cors());
    app.use(helmet());
    app.use(morgan('dev'));
};

export const initServer = async () => {
    const app = express();
    const PORT = process.env.PORT || 3000;

    try {
        middlewares(app);
        routes(app);
        app.use(errorHandler);
        app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
    } catch (err) {
        console.error(`Error al iniciar el servidor: ${err.message}`);
        process.exit(1);
    }
};