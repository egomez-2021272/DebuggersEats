import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
 
const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'DebuggersEats — Add Restaurant Service',
            version: '1.0.0',
            description: 'Documentación del servicio de restaurantes de DebuggersEats'
        },
        servers: [
            {
                url: 'http://localhost:3000',
                description: 'Servidor local'
            }
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT'
                }
            }
        },
        security: [{ bearerAuth: [] }],
        tags: [
            { name: 'Restaurants',        description: 'Gestión de restaurantes' },
            { name: 'Menu',               description: 'Platos y bebidas del menú' },
            { name: 'Orders',             description: 'Carrito y pedidos' },
            { name: 'Reservations',       description: 'Reservaciones de mesas' },
            { name: 'Tables',             description: 'Mesas del restaurante' },
            { name: 'Reviews',            description: 'Reseñas y respuestas' },
            { name: 'Gastronomic Events', description: 'Eventos, promociones y cupones' }
        ]
    },
    apis: [
        './src/restaurants/restaurant.routes.js',
        './src/menu/menu.routes.js',
        './src/orders/order.routes.js',
        './src/reservations/reservation.routes.js',
        './src/tables/table.routes.js',
        './src/reviews/review.routes.js',
        './src/gastronomicEvents/event.routes.js'
    ]
};
 
const swaggerSpec = swaggerJsdoc(options);
 
export const swaggerDocs = (app) => {
    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
        customSiteTitle: 'DebuggersEats API Docs',
        swaggerOptions: {
            persistAuthorization: true
        }
    }));
 
    app.get('/api-docs.json', (req, res) => {
        res.setHeader('Content-Type', 'application/json');
        res.send(swaggerSpec);
    });
};