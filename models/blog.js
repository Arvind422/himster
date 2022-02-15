const mongoose= require("mongoose");
const passportLocalMongoose = require("passport-local-mongoose");

// Blog schema
const blogSchema = new mongoose.Schema ({
  blog_title: {
          type: String,
          required: true
        },    
  blog_date: {
          type: String,
          required: true
        },    
  blog_desc1: {
          type: String,
          required: true
        },
  blog_desc2: {
          type: String,
          required: true
        },    
  blog_desc3: {
          type: String,
          required: true
        },    
      
  blog_img:{
    type: String,
    required: true
  }
});

// blog model
module.exports = new mongoose.model("blog", blogSchema);
