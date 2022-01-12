const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const placeSchema = new Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    image: { type: String, required: true },
    address: { type: String, required: true },
    location: { 
        lat: { type: Number, required: true },
        lng: { type: Number, required: true },
    },
    creator: { type: Schema.Types.ObjectID, required: true, ref: 'User' }
});

module.exports = mongoose.model('Place', placeSchema);