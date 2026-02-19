import { Schema, model } from 'mongoose';

const restaurantSchema = new Schema({
    name: {
        type: String,
        required: [true, 'El nombre es obligatorio'],
        trim: true,
        maxLength: [100, 'Máximo 100 caracteres']
    },
    address: {
        type: String,
        required: [true, 'La dirección es obligatoria']
    },
    phone: {
        type: String,
        required: [true, 'El teléfono es obligatorio']
    },
    category: {
        type: String,
        enum: {
            values: ['COMIDA_RAPIDA', 'ITALIANA', 'CHINA', 'MEXICANA', 'CAFETERIA'],
            message: 'Categoría no válida'
        },
        required: true
    },
    createdBy: {
        type: Schema.Types.ObjectId,
        required: true
    }
}, {
    timestamps: true,
    versionKey: false
});

export default model('Restaurant', restaurantSchema);
