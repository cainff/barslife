var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var barSchema = mongoose.Schema(
    {
        name: String,
        address: String,
        lat: Number,
        lng: Number,
        description: String,

    },
    { collection: 'bars' }
);

module.exports = mongoose.model('Bar', barSchema);
