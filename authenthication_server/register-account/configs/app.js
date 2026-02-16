'use strict';

require('dotenv').config();

const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const morgan = require('morgan');

const userController = require('../src/fields/field.controller');
const { registerValidation } = require('../middlewares/file-validator');
const errorHandler = require('../middlewares/handle-errors');
const User = require('../src/fields/field.model');

const BASE_PATH = '/bank/v1';


const routes = (app) => {

    // Registro
    app.post(`${BASE_PATH}/register`, registerValidation, userController.registerUser);

    // CRUD Usuarios
    app.get(`${BASE_PATH}/users`, userController.getUsers);
    app.get(`${BASE_PATH}/users/:id`, userController.getUserById);
    app.put(`${BASE_PATH}/users/:id`, userController.updateUser);
    app.delete(`${BASE_PATH}/users/:id`, userController.deleteUser);

    // Health check
    app.get(`${BASE_PATH}/health`, (req, res) => {
        res.status(200).json({
            status: 'Healthy',
            timeStamp: new Date().toISOString(),
            service: 'Bank API'
        });
    });

    // 404 handler
    app.use((req, res) => {
        res.status(404).json({
            success: false,
            message: 'Endpoint no encontrado'
        });
    });
};


const middlewares = (app) => {
    app.use(express.json({ limit: '10mb' }));
    app.use(express.urlencoded({ extended: false }));
    app.use(express.static(path.join(__dirname, 'public')));
    app.use(morgan('dev'));
};

const initServer = async () => {

    const app = express();
    const PORT = process.env.PORT || 3000;

    try {

        middlewares(app);

        // Conexión a MongoDB
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Conectado a MongoDB');

        await User.syncIndexes();

        routes(app);

        // Error handler global
        app.use(errorHandler);

        app.listen(PORT, () => {
            console.log(`Server running on http://localhost:${PORT}${BASE_PATH}/health`);
        });

    } catch (error) {
        console.error('Error al iniciar el servidor:', error.message);
        process.exit(1);
    }
};

initServer();

module.exports = initServer;