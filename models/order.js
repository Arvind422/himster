const mongoose= require("mongoose");
const passportLocalMongoose = require("passport-local-mongoose");

var orderSchema = new mongoose.Schema({
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    total: {
        type: Number,
        default: 0
    },
    transactionComplete: {
        type: Boolean,
        default: false
    },
    orderComplete: {
        type: Boolean,
        default: false
    },
    transactionID: {
        type: String,
        default: ''
    },
    orderdate: {
        type: String,
        default: ''
    },
    paymentmethod: {
        type: String,
        default: ''
    },
    items: [
      {
        productId: String,
        quantity: Number,
        name: String,
        desc: String,
        img: String,
        price: Number,
        ttlprice: Number,
      }
    ]
   
});

module.exports= new mongoose.model("Order", orderSchema);
