const mongoose= require("mongoose");
const passportLocalMongoose = require("passport-local-mongoose");

const wishlistSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },
    wishlists: [
      {
        productId: String,
        name: String,
        desc: String,
        img: String,
        price: Number,
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

module.exports= new mongoose.model("wishlist", wishlistSchema);
