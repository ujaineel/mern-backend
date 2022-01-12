const { v4: uuid} = require('uuid');
const { validationResult } = require('express-validator');

const HttpError = require("../models/http-error");
const getCoordsForAddress = require("../util/locationController.js");
const Place = require("../models/place");

const getPlaceById = async (req, res, next) => {
    const placeId = req.params.pid;

    let place;

    try{
        place = await Place.findById(placeId);
    } catch(err){
        const error = new HttpError('Something went wrong, could not find a place.', 500);
        return next(error);
    }

    if (!place){
        const error = new HttpError('Could not find places for the provided id.', 404);
        return next(error);
    }

    res.json({ place: place.toObject( { getters: true }) }); // => {place: place}
};

// function getPlaceById() { ... }
// const getPlaceById = function() { ... }

const getPlacesByUserId = async (req, res, next) => {
    const userId = req.params.uid;

    let places;

    try{
        places = await Place.find({ creator: userId });
    } catch(err){
        const error = new HttpError('Fetching places failt, please try again later.', 500);
        return next(error);
    }

    if (!places || places.length === 0){
        const error = new HttpError('Could not find a place for the provided id.', 404);
        return next(error);
    }

    res.json({ places: places.map(place => place.toObject({ getters: true })) });
};

const createPlace = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()){
        return next(new HttpError('Invalid inputs passed, please check your data.', 422));
    }

    const { title, description, address, creator } = req.body;
    
    let coordinates;
    try{
        coordinates = await getCoordsForAddress(address);
    } catch(error){
        return next(error);
    }

    const createdPlace = new Place({
        title,
        description,
        address,
        location: coordinates,
        image: "https://marvel-b1-cdn.bc0a.com/f00000000179470/www.esbnyc.com/sites/default/files/styles/small_feature/public/2019-10/home_banner-min.jpg?itok=uZt-03Vw",
        creator
    });

    try {
        await createdPlace.save();
    } catch (err){
        const error = new HttpError('Creating place failed, please try again.', 500);
        return next(error);
    }
    
    res.status(201).json({ place: createdPlace });
};

const updatePlace = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()){
        const error = new HttpError('Invalid inputs passed, please check your data.', 422);
        return next(error);
    }

    const { title, description } = req.body;
    const placeId = req.params.pid;

    let place;
    try {
        place = await Place.findByIdAndUpdate(placeId, { title: title, description: description });
    } catch(err) {
        const error = new HttpError("Could not update the place", 500);
        return next(error);
    }

    if (!place){
        const error = new HttpError('Could not find places for the provided id.', 404);
        return next(error);
    }
    
    res.status(200).json({place: place.toObject({ getters: true })});
};

const deletePlace = async (req, res, next) => {
    const placeId = req.params.pid;

    let place;
    try {
        place = await Place.findByIdAndDelete(placeId);
    } catch (err) {
        const error = new HttpError("Could not delete the place", 500);
        return next(error);
    }

    if (!place){
        const error = new HttpError('Could not find places for the provided id.', 404);
        return next(error);
    }

    res.status(200).json({message: 'Deleted place.', place: place.toObject({ getters: true})});
};

exports.getPlaceById = getPlaceById;
exports.getPlacesByUserId = getPlacesByUserId;
exports.createPlace = createPlace;
exports.updatePlace = updatePlace;
exports.deletePlace = deletePlace;