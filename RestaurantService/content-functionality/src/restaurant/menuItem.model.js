import {Schema, model} from 'mongoose';

const menuItemSchema = new Schema({
    restaurantId: { type: Schema.Types.ObjectId, ref: 'Restaurant', required: true },
    name: { type: String, required: true },
    description: { type: String },
    price: { type: Number, required: true },
    category: { type: String, enum: ['Entradas', 'Principal', 'Postres', 'Bebidas'], required: true },
    isAvailable: { type: Boolean, default: true },
    imageUrl: { type: String }
});

export default model('MenuItem', menuItemSchema);