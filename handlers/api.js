const Attraction = require('../models/attraction');
module.exports.getAttraction = function (req, res) {
    Attraction.find({approved: true}, function (err, attractions) {
        if (err) return res.send(500, 'Error occurred: database error.');
        res.json(attractions.map(function (a) {
            return {
                name: a.name,
                id: a.id,
                description: a.description,
                location: a.location
            };
        }));
    });
};

module.exports.postAttraction = function (req, res) {
    let a = new Attraction({
        name: req.body.name,
        description: req.body.description,
        location: {lat: req.body.lat, lng: req.body.lng},
        history: {
            event: 'created',
            email: req.body.email,
            date: new Date()
        },
        approved: false
    });
    a.save(function (err, a) {
        if (err) return res.send(500, 'Error occurred: database error.');
        res.json({id: a.id});
    });
};

module.exports.getAttractionById = function (req, res) {
    Attraction.findById(req.params.id, function (err, a) {
        if (err) return res.send(500, 'Error occurred: database error.');
        res.json({
            name: a.name,
            id: a._id,
            description: a.description,
            location: a.location
        });
    });
};

module.exports.restGetAttraction = async function (req, context) {
    let result = {};
    await Attraction.find({approved: true}, function (err, attractions) {
        if (err) return result = {error: 'Internal error.'};
        result = attractions.map(function (a) {
            return {
                name: a.name,
                id: a.id,
                description: a.description,
                location: a.location
            };
        });
    });
    return result;
};

module.exports.restPostAttraction = async function (req, context) {
    let result = {};
    let a = new Attraction({
        name: req.body.name,
        description: req.body.description,
        location: {lat: req.body.lat, lng: req.body.lng},
        history: {
            event: 'created',
            email: req.body.email,
            date: new Date()
        },
        approved: false
    });
    await a.save(function (err, a) {
        if (err) return result = {error: 'Unable to add attraction.'};
        result = {id: a.id};
    });
    return result;
};

module.exports.restGetAttractionById = async function (req, context) {
    let result = {};
    await Attraction.findById(req.params.id, function (err, a) {
        if (err) result = {error: 'Unable to retrieve attraction.'};
        return result = {
            name: a.name,
            id: a._id,
            description: a.description,
            location: a.location
        };
    });
    return result;
};