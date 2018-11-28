const mongoose = require('mongoose');

let orderSchema = mongoose.Schema({
    /* TODO */
});

let Order = mongoose.model('Order', orderSchema);
module.exports = Order;