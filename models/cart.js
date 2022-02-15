const mongoose= require("mongoose");
const passportLocalMongoose = require("passport-local-mongoose");

const CartSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },
    products: [
      {
        productId: String,
        quantity: Number,
        name: String,
        desc: String,
        img: String,
        price: Number,
        ttlprice: Number,
      }
    ],
    active: {
      type: Boolean,
      default: true
    },
    modifiedOn: {
      type: Date,
      default: Date.now
    }
  },
  { timestamps: true }
);

module.exports= new mongoose.model("Cart", CartSchema);
