const mongoose= require("mongoose");
const passportLocalMongoose = require("passport-local-mongoose");

const productSchema = new mongoose.Schema ({
  prod_title: String,   
  prod_subtitle: String,
  prod_cat: String,  
  prod_originalprice : Number,
  prod_discountedprice : Number,   
  prod_desc : String,
  prod_color : String,
  prod_img1: String,
  prod_img2 : String,
  prod_img3 : String
});

module.exports= new mongoose.model("product", productSchema);
