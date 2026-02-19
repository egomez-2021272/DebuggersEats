import {Schema, model} from 'mongoose';

const tableSchema = new Schema({
    restaurantId: { type: Schema.Types.ObjectId, ref: 'Restaurant', required: true },
    number: { type: Number, required: true },
    capacity: { type: Number, default: 4 },
    location: { type: String, enum: ['Interior', 'Terraza', 'VIP'], default: 'Interior' },
    status: { type: String, enum: ['Libre', 'Ocupada', 'Reservada'], default: 'Libre' },
});

export default model('Table', tableSchema);