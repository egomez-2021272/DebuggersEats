import {Schema, model} from 'mongoose';

const detailsSchema = new Schema({
    restaurantId: { type: Schema.Types.ObjectId, ref: 'Restaurant', required: true },
    address:{street: String, city: String, zipCode: String, reference: String},
    contact:{phone: String, email: String, instragram: String},
    schedule:{open: String, close: String}
});

export default model('RestaurantDetails', detailsSchema);