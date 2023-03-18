const mongoose= require("mongoose");
const passportLocalMongoose = require("passport-local-mongoose");

const useraddressSchema = new mongoose.Schema ({
  email: {
    type: String,
    unique: false
  },
  firstname: String,
  lastname: String,
  fullname: String,
  phone: Number,
  gender: String,
  address: String,
  town: String,
  city: String,
  pincode: Number,
  state: String,
  typeofaddress: String
  
});

module.exports= new mongoose.model("address", useraddressSchema);
