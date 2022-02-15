const mongoose= require("mongoose");
const passportLocalMongoose = require("passport-local-mongoose");

// product review schema
const prSchema = new mongoose.Schema ({
  title: String,   
  name: String,
  year: Number,  
  month: String,
  day : Number,
  star: Number,   
  time : String,
  review : String,
  img: String
});



module.exports = new mongoose.model("pr", prSchema);

