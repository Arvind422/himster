
require('dotenv').config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const Request = require("request");
const mongoose = require("mongoose");
const session = require('express-session');
const flash = require('connect-flash');
const multer= require("multer");
const path= require("path");
const nodemailer = require('nodemailer');
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const FacebookStrategy= require('passport-facebook').Strategy;
const findOrCreate = require('mongoose-findorcreate');
const https = require('https');
const checkSum = require('./paytm/checksum')


const app=express();


// initializing multer
const storage= multer.diskStorage({
  destination: './public/uploads/',
  filename: function(req, file, cb){
    cb(null,file.fieldname +'-' + Date.now() + path.extname(file.originalname));

  }
});

const fileFilter= (req,file, cb) =>{
  if(
    file.mimetype === 'image/png' ||
    file.mimetype === 'image/jpg' ||
    file.mimetype === 'image/jpeg'
    ){
    cb(null, true);
  }
  else{
    cb(null, false);
  }
}





app.use(express.static("public"));

app.use('/shop/:prodcategory', express.static("public"));

app.use('/order-details/:orderid/', express.static("public"));

app.use('/checkout/:userId', express.static("public"));

app.use('/admin/add_review/:prodname', express.static("public"));

app.use('/admin/editproduct/:prodtitle', express.static("public"));

app.use('/admin/editblog/:blogtitle', express.static("public"));

app.use('/admin/myproducts', express.static("public"));

app.use('/admin/myblogs', express.static("public"));


app.use('/blogs/:blogtitle', express.static("public"));

app.use('/products/:prodname', express.static("public"));

app.use('/editaddress/:addid', express.static("public"));


app.set('view engine','ejs');
app.use(bodyParser.urlencoded({
  extended: true
}));




//  multer
app.use(multer({storage: storage, fileFilter: fileFilter}).single("myimage"));



mongoose.connect("mongodb+srv://anuj:anujtest@cluster0-iher4.mongodb.net/himsterDB",{useNewUrlParser: true, useUnifiedTopology: true});
// mongoose.connect("mongodb://localhost:27017/himsterDB", {useNewUrlParser: true,useUnifiedTopology: true});
mongoose.set("useCreateIndex", true);





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





// product schema
const productSchema = new mongoose.Schema ({
  prod_title: String,   
  prod_subtitle: String,
  prod_cat: String,  
  prod_originalprice : Number,
  prod_discountedprice : Number,   
  prod_desc : String,
  prod_color : String,
  instock: {
    type: Boolean,
    default: true
  },
  prod_img1: String,
  prod_img2 : String,
  prod_img3 : String
});



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



// blog model
const blog = new mongoose.model("blog", blogSchema);
// product model
const product = new mongoose.model("product", productSchema);

// product review model
const pr = new mongoose.model("pr", prSchema);


app.use(session({
  secret: "Our little secret.",
  resave: false,
  saveUninitialized: false
}));



app.use(flash());


app.use(passport.initialize());
app.use(passport.session());


const userSchema = new mongoose.Schema ({
  email: String,
  username: String,
  profile: String,
  confirmed: Boolean,
  password: String,
  firstname: String,
  lastname: String,
  fullname: String,
  phone: Number,
  gender: String,
  address: String,
  town: String,
  district: String,
  pincode: Number,
  image: String,
  state: String,
  typeofaddress: String,
  facebookId:String,
  googleId: String,
  secret: String,

});

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
    orderCancelled: {
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
  district: String,
  pincode: Number,
  state: String,
  typeofaddress: String
  
});

var paymentSchema = new mongoose.Schema({
  currency: {
      type: String,
      required: true
  },
  gatewayname: {
      type: String,
      required: true
  },
  respmsg: {
      type: String,
      required: true
  },
  bankname: {
      type: String,
      required: true
  },
  paymentmode: {
      type: String,
      required: true
  },
  mid: {
      type: String,
      required: true
  },
  respcode: {
      type: String,
      required: true
  },
  txnid: {
      type: String,
      required: true
  },
  txnamount: {
      type: Number,
      required: true
  },
  orderid: {
      type: String,
      required: true
  },
  banktxnid: {
      type: String,
      required: true
  },
  txndate: {
      type: String,
      required: true
  },
  status: {
      type: String,
      required: true
  }
  
    
   
});

const payment = new mongoose.model("payment", paymentSchema);




userSchema.plugin(passportLocalMongoose);
userSchema.plugin(findOrCreate);

const wishlist= new mongoose.model("wishlist", wishlistSchema);


const User = new mongoose.model("User", userSchema);

const address = new mongoose.model("address", useraddressSchema);

const Cart= new mongoose.model("Cart", CartSchema);

const Order = new mongoose.model("Order", orderSchema);




passport.use(User.createStrategy());

passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  User.findById(id, function(err, user) {
    done(err, user);
  });
});

passport.use(new GoogleStrategy({
    clientID: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    callbackURL: "https://himster.in/auth/google/himster",
    userProfileURL: "https://www.googleapis.com/oauth2/v3/userinfo"
  },
  function(accessToken, refreshToken, profile, cb) {
    // console.log(profile.id,profile.displayName,profile.name.givenName,profile.name.familyName);

    User.findOrCreate({ googleId: profile.id }, function (err, user) {
       User.updateOne({googleId: profile.id},{confirmed: true,image: profile.photos[0].value,firstname:profile.name.givenName, lastname:profile.name.familyName, fullname:profile.displayName},function(err){
          if(err){
            console.log(err);
          }
          
       });
       return cb(err, user);
      

    });
  }
));


passport.use(new FacebookStrategy({
    clientID:'1914535628686016' ,
    clientSecret: 'b35f45aa344c5cc86fec7e9ec0e368f0',
    callbackURL: "https://himster.in/auth/facebook/callback",
    profileFields: ['id', 'displayName', 'photos', 'email','gender','profileUrl']
  },
  function(accessToken, refreshToken, profile, cb) {
    // console.log(profile);
    // console.log(profile.displayName);
    const arr= (profile.displayName).split(" ");
    const firstname = arr[0];
    const lastname = arr[1];
    // console.log(arr,firstname,lastname);
    // console.log(profile.photos[0].value);
    User.findOrCreate({ facebookId: profile.id }, function (err, user) {
      User.updateOne({facebookId: profile.id},{confirmed: true, firstname: firstname, lastname: lastname,  fullname:profile.displayName, image: profile.photos[0].value},function(err){
          if(err){
            console.log(err)
          }
          
       });
      
      return cb(err, user);
    });
    
  }
));


app.get("/auth/google/",
  passport.authenticate('google', { scope: ["profile"] })
);

app.get("/auth/google/himster",
  passport.authenticate('google', { failureRedirect: "/login" }),
  function(req, res) {
    // Successful authentication, redirect to secrets.
    req.flash('login','Logged-in Successfully!!!');
    res.redirect("/");
  });

app.get('/auth/facebook',
  passport.authenticate('facebook'));

app.get('/auth/facebook/callback',
  passport.authenticate('facebook', { failureRedirect: '/login' }),
  function(req, res) {
    // Successful authentication, redirect home.
    req.flash('login','Logged-in Successfully!!!');
    res.redirect('/');
  });



//Router for forwarding to paytm 
app.get('/paywithpaytm', (req, res, next) => {
let ttl=0;
  console.log("owner",req.query.id);

    var order = new Order({
        owner: req.query.id
    })
    Cart.findOne({ userId: req.query.id }, (err, cart) => {
        if (err) throw err
        if (!cart) res.redirect('/cart')
         // console.log(cart.products)
        order.items = cart.products

      for(i in (order.items)){
        ttl += (order.items)[i].ttlprice;
      }
      order.total= ttl;
      order.save()
            .then(() => {
                var params = new Map();
                params['MID'] = process.env.MID,
                params['WEBSITE'] = 'DEFAULT',
                params['CHANNEL_ID'] = 'WEB'
                params['INDUSTRY_TYPE_ID'] = 'Retail'
                params['ORDER_ID'] = order._id
                params['CUST_ID'] = req.query.id
                params['TXN_AMOUNT'] = Number(ttl)
                params['CALLBACK_URL'] = "https://himster.in/paymentDone";

                 // params['CALLBACK_URL'] = "http://" + req.get('host') + '/paymentDone';

                checkSum.genchecksum(params, process.env.PAYTM_MERCHANT_KEY, function (err, checksum) {
                    if (err) throw err
                    // var txn_url = "https://securegw-stage.paytm.in/theia/processTransaction"; // for staging
                    var txn_url = "https://securegw.paytm.in/order/process"; // for production
                    var form_fields = "";
                    for (var x in params) {
                        form_fields += "<input type='hidden' name='" + x + "' value='" + params[x] + "' >";
                    }
                    form_fields += "<input type='hidden' name='CHECKSUMHASH' value='" + checksum + "' >";
                    res.writeHead(200, { 'Content-Type': 'text/html' });
                    res.write('<html><head><title>Merchant Checkout Page</title></head><body><center><h1>Please do not refresh this page...</h1></center><form method="post" action="' + txn_url + '" name="f1">' + form_fields + '</form><script type="text/javascript">document.f1.submit();</script></body></html>');
                    res.end();
                });
            })
            .catch(err => next(err))
    })
})

//Router to receive payment and confirm order
app.post('/paymentDone', (req, res, next) => {

let userid= '';
console.log( req.user);
   console.log("paymentDone order details:",req.body);
    if (req.body.RESPCODE == '01') {
       let merchantdata= {
            currency: req.body.CURRENCY,
            gatewayname: req.body.GATEWAYNAME,
            respmsg: req.body.RESPMSG,
            bankname: req.body.BANKNAME,
            paymentmode: req.body.PAYMENTMODE,
            mid: req.body.MID,
            respcode: req.body.RESPCODE ,
            txnid: req.body.TXNID,
            txnamount: req.body.TXNAMOUNT,
            orderid: req.body.ORDERID,
            status: req.body.STATUS,
            banktxnid: req.body.BANKTXNID,
            txndate: req.body.TXNDATE



       };
       payment.create(merchantdata,(err,data)=>{
        if(err){
          console.log(err);

        }
       });



        //Finding this order
        Order.findById(req.body.ORDERID, (err, order) => {
            if (err) throw err
            if (!order) {
                return req.send("Transaction Failed, Please retry!!")
            }
            var params = req.body
            userid= order.owner
            // console.log(userid)
            // console.log(order)
            order.transactionID = params.TXNID
            var checkSumHash = params.CHECKSUMHASH
            delete params.CHECKSUMHASH
            var result = checkSum.verifychecksum(params, process.env.PAYTM_MERCHANT_KEY, checkSumHash);
            //CheckSum has been Verified
            if (result) {
                //Final Step
                //Let's do final re-verification
                checkSum.genchecksum(params, process.env.PAYTM_MERCHANT_KEY, function (err, checksum) {
                    if (err) throw err

                    params.CHECKSUMHASH = checksum;
                    post_data = 'JsonData=' + JSON.stringify(params);

                    var options = {
                        // hostname: 'securegw-stage.paytm.in', // for staging
                        hostname: 'securegw.paytm.in', // for production
                        port: 443,
                        path: '/merchant-status/getTxnStatus',
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/x-www-form-urlencoded',
                            'Content-Length': post_data.length
                        }
                    };
                    
                    // Set up the request
                    var response = "";
                    var post_req = https.request(options, function (post_res) {
                        post_res.on('data', function (chunk) {
                            response += chunk;
                        });

                        post_res.on('end', function () {
                            // console.log('S2S Response: ', response, "\n");
                            var _result = JSON.parse(response);
                            //We need to match orderID and amount
                            if (_result.TXNAMOUNT == params.TXNAMOUNT && _result.ORDERID == params.ORDERID) {
                                Order.findById(params.ORDERID, (err, relt) => {
                                    relt.transactionComplete = true
                                    relt.transactionID= params.TXNID
                                    relt.orderdate= params.TXNDATE
                                    relt.paymentmethod= params.GATEWAYNAME
                                    
                                            relt.save()
                                                .then(() => {
                                                    //Clear the cart
                                                    Cart.findOne({  userId: userid }, (err, crt) => {
                                                        if (err) throw err
                                                      // console.log("cart" + crt);
                                                        crt.products = []
                                                        crt.save()
                                                            .then(() => {



var transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'StoreHimster@gmail.com',
    pass: 'lhmbxxsxoolshsrf'
  }
});

var maillist = [
  ''+req.user.email,
  'rangtechnostore@gmail.com',
];

var mailOptions = {
  from: 'StoreHimster@gmail.com',
  to: maillist,
  subject: 'Order Successful!!!',
  html: `	<div style="text-align: center;"><img src="https://i.ibb.co/CJhrftz/tick.jpg" alt="SuccessTick" width="50" height="auto" border="0"><h3 style="font-weight: 400;font-family: 'Poppins', sans-serif;margin-top: 12px;margin-bottom: 10px;line-height: 1.1;color: inherit;">Thank you! For your payment</h3><p style=" font-family: 'Poppins' sans-serif;color: inherit;font-size: 15px;margin: 0 0 10px;">Your order has been <b>Successfully </b>placed!!!</p>
            <p style=" font-family: 'Poppins' sans-serif;color: inherit;font-size: 15px;margin: 0 0 10px;">Your Order Id: <b>${req.body.ORDERID}</b></p><b>Please go to the your orders page for more detail on the order.</b></div>`        
};

transporter.sendMail(mailOptions, function(error, info){
  if (error) {
    console.log(error);
  } else {
   
     res.redirect('/order_confirmation');
  }
});
 console.log("Mail sent to user successfully");                                                          
                                                            })
                                                    
var transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'StoreHimster@gmail.com',
    pass: 'lhmbxxsxoolshsrf'
  }
});

var maillist1 = [
  'rangtechnostore@gmail.com',
];

var mailOptions = {
  from: 'StoreHimster@gmail.com',
  to: maillist1,
  subject: 'Order Successful!!!',
  html: `	<div style="text-align: center;"><img src="https://i.ibb.co/CJhrftz/tick.jpg" alt="SuccessTick" width="50" height="auto" border="0"><h3 style="font-weight: 400;font-family: 'Poppins', sans-serif;margin-top: 12px;margin-bottom: 10px;line-height: 1.1;color: inherit;">Thank you! For your payment</h3><p style=" font-family: 'Poppins' sans-serif;color: inherit;font-size: 15px;margin: 0 0 10px;">Your order has been <b>Successfully </b>placed!!!</p>
            <p style=" font-family: 'Poppins' sans-serif;color: inherit;font-size: 15px;margin: 0 0 10px;">Customer Order Id: <b>${req.body.ORDERID}</b></p><br>Customer Details: <b>${req.user}</b></div>`        
};

transporter.sendMail(mailOptions, function(error, info){
  if (error) {
    console.log(error);
  } else {
   
     res.redirect('/order_confirmation');
  }
});
                                                    
                                                          })
                                                })
                                        }).catch(err => next(err))
                                // })
                            }
                            else {
                                
                                res.send('<!DOCTYPE html><html><head><title>Failed Transaction</title></head><body>"Transaction Failed, Please retry!!" <script>setTimeout(function () { window.location = "/cart";}, 2000)</script></body></html>');
                            }

                        });
                    });

                    // post the data
                    post_req.write(post_data);
                    post_req.end();
                });

            } else {
               res.send('<!DOCTYPE html><html><head><title>Failed Transaction</title></head><body>"Transaction Failed, Please retry!!" <script>setTimeout(function () { window.location = "/cart";}, 2000)</script></body></html>');
            }
        })
    } else {

      res.send('<!DOCTYPE html><html><head><title>Failed Transaction</title></head><body>"Transaction Failed, Please retry!!" <script>setTimeout(function () { window.location = "/cart";}, 2000)</script></body></html>');
    }
});



//payment page
app.get("/adminpayments",(req,res)=>{

  let usr= {};
  let authentication= false;
  if(req.isAuthenticated()){

    usr= req.user;
    if(usr.confirmed && (usr.email == 'storehimster@gmail.com')){
      authentication= true;

      payment.find({},(err,mdata)=>{
        if(err){
          // console.log(err);
          res.render(__dirname+ "/views/wrongpg");
        }
        else{
          
          res.render(__dirname + "/views/succ_payments",{mdata :mdata, usr: usr,authentication: authentication});
        }
      });
    }
    else
    {
      res.render(__dirname + "/views/404");

    }
  }
  else{
    res.redirect("/login");
  
  }


});

app.get("/admin_orders",(req,res)=>{

  let usr= {};
  let authentication= false;
  if(req.isAuthenticated()){
  
    usr= req.user;
    if(usr.confirmed && (usr.email == 'storehimster@gmail.com')){
      authentication= true;

      payment.find({},(err,mdata)=>{
        if(err){
          res.render(__dirname+ "/views/wrongpg");
        }
        else{
          
          res.render(__dirname + "/views/admin-orders",{mdata :mdata, usr: usr,authentication: authentication});


        }
      });

      
    }
    else
    {
      res.render(__dirname + "/views/404");

    }
  }
  else{
    res.redirect("/login");
  
  }


});

app.post("/ordercompleted",(req,res)=>{
  // console.log(req.body.ordercompleted);
  Order.updateOne({_id: req.body.ordercompleted},{orderComplete: true},(err)=>{
    if(err){
      // console.log(err)
      res.render(__dirname+ "/views/wrongpg");
    }
    else{
      payment.deleteOne({orderid: req.body.ordercompleted},(err)=>{
        if(err){
          // console.log(err);
          res.render(__dirname+ "/views/wrongpg");
        }
        else
        {
          // console.log("success");
          res.redirect("/admin_orders");
        }
      });

    }
  });
});

app.post("/ordercancelled",(req,res)=>{
  // console.log(req.body.ordercancelled); -- -used for in transt update
  
  Order.updateOne({_id: req.body.ordercancelled},{orderCancelled: true},(err)=>{
    if(!err){
      res.redirect("/admin_orders");
    }
  });
  
  // Order.updateOne({_id: req.body.ordercancelled},{orderCancelled: true},(err)=>{
  //   if(err){
  //     // console.log(err)
  //     res.render(__dirname+ "/views/wrongpg");
  //   }
  //   else{
  //     payment.deleteOne({orderid: req.body.ordercancelled},(err)=>{
  //       if(err){
  //         // console.log(err);
  //         res.render(__dirname+ "/views/wrongpg");
  //       }
  //       else
  //       {
  //         // console.log("success");
  //         res.redirect("/admin_orders");
  //       }
  //     });

  //   }

  // });
});


app.post("/adminorders",(req,res)=>{
  // console.log(req.body);
  Order.find({_id: req.body.orderid},(err,foundorder)=>{
    if(err){
      res.send("invalid Order Id");

    }
    else
    {
      User.find({_id: foundorder[0].owner},(err,founduser)=>{
        if(err){
          // console.log(err)
          res.render(__dirname+ "/views/wrongpg");
        }
        else{
          // console.log(founduser[0].fullname);
          const address= founduser[0].address +", "+ founduser[0].town + "-" + founduser[0].pincode + ", " + founduser[0].state;
          res.render(__dirname + "/views/admin-order-details",{orderid: req.body.orderid  ,usermail: founduser[0].username, fullname: founduser[0].fullname, address: address, phone: founduser[0].phone, typeofaddress: founduser[0].typeofaddress, items: foundorder[0].items});

        }
      })
    }
  })
})

// admin upload blogs
app.get("/upload_blogs",(req,res)=>{

  let usr= {};
  let authentication= false;
  if(req.isAuthenticated()){
    
    usr= req.user;
    if(usr.confirmed && (usr.email == 'storehimster@gmail.com')){
      authentication= true;
      res.render(__dirname + "/views/upload-blogs",{usr: usr,authentication: authentication});

    }
    else
    {
      res.render(__dirname + "/views/404");

    }
  }
  else{
    res.redirect("/login");
  
  }
  
});

app.post("/upload_blogs",(req,res)=>{

  let usr= {};
  let authentication= false;
  if(req.isAuthenticated()){
    authentication= true
    usr= req.user
  }
  else{
    authentication= false
  
  }

  const blogdate= new Date();
  var monthNames = ["January", "February", "March", "April", "May","June","July", "August", "September", "October", "November","December"];
  
  let currentdate= (blogdate.getDate()).toString() + ", "+ (monthNames[blogdate.getMonth()]).toString() +" "+ (blogdate.getFullYear()).toString(); 

  blog.create({blog_title: req.body.title, blog_desc1: req.body.desc1, blog_desc2: req.body.desc2,blog_desc3: req.body.desc3,blog_img: req.file.path, blog_date: currentdate},function(err,small){
    if(err){
      return handleError(err);
    }
  });


req.flash("msg","One new blog Uploaded successfully!!!");
  res.redirect("/admin/myblogs");
 
});


// home page
app.get("/",(req,res)=>{
  let usr= {};
  let authentication= false;
  let numofwishlists= 0;
  let numofcarts= 0;
  let foundcarts=[];
  if(req.isAuthenticated()){
    // console.log(req.user);
    usr= req.user;
    if(usr.confirmed == true){
      authentication= true;


    wishlist.findOne({userId: usr._id},(err,foundwishlist)=>{
      if(err){
        // console.log(err);
        res.render(__dirname+ "/views/wrongpg");
      }
      else
      {
        // console.log(foundwishlist);
        if(foundwishlist){

          numofwishlists= (foundwishlist.wishlists).length;
           // console.log(numofwishlists);
        }
      }
    });

    Cart.findOne({userId: usr._id},(err,foundcart)=>{
      if(err){
        // console.log(err);
        res.render(__dirname+ "/views/wrongpg");
      }
      else
      {

         if(foundcart){
          
         // console.log((foundcart.products).length);
         numofcarts= (foundcart.products).length;
         foundcarts= foundcart.products;
         }
         
         
      }
    });


    
    }
    else
    {
      authentication: false;
    }
    
  }
  else{
    authentication= false;
  }
  product.find({},(err,trendingprod)=>{
    if(err){
      // console.log(err);
      res.render(__dirname+ "/views/wrongpg");
    }
    else
    {
       // console.log(trendingprod);
      // console.log(usr,authentication);
      // console.log(foundcarts);
      res.render(__dirname+ "/views/index",{emailverification: req.flash('emailverification'),login: req.flash('login'),logout: req.flash("logout") ,message: req.flash('message') ,msg: req.flash('msg') ,foundcarts: foundcarts,numofcarts: numofcarts  ,numofwishlists: numofwishlists,allproducts : trendingprod, usr: usr,authentication: authentication});
    }
  })
  
});

// register and login area

app.get("/register",(req,res)=>{

  let usr= {};
  let authentication= false;
  if(req.isAuthenticated()){
    
    usr= req.user;
    if(usr.confirmed){
      authentication= true;
    }
    else
    {
      authentication= false;
    }
  }
  else{
    authentication= false;
  
  }
  res.render(__dirname+ "/views/register",{regerr: req.flash('regerr'),msg: req.flash('info'),message: req.flash('passerr'),usr: usr,authentication: authentication});
});


app.get("/login",(req,res)=>{
    let usr= {};
  let authentication= false;

  if(req.isAuthenticated()){
    usr= req.user;
    if(usr.confirmed){
      authentication= true;
    }
    else
    {
      authentication= false;
    }
  }
  else{
    authentication= false;
    // console.log("req is not authenticated");
  }
  res.render(__dirname+ "/views/login",{passsuccess: req.flash('passsuccess') ,fgmail: req.flash('fgmail') ,dgemail: req.flash('dgemail')  ,loginerr: req.flash('loginerr') ,usrdnexist: req.flash("usrdnexist") ,usr: usr, authentication: authentication});


});



var rand=0
function setRandom(){
    return rand= (Math.ceil(9997 + 3+ Math.random() * 9000)).toString();
}

setRandom(3);
setInterval(setRandom, 600000);


app.post("/register", function(req, res){

const RECAPTCHA_SECRET = "6LcXP7wZAAAAAGWNAOvCp7ApMP_ocjzcfWW-fKNK";

 var recaptcha_url = "https://www.google.com/recaptcha/api/siteverify?";
    recaptcha_url += "secret=" + RECAPTCHA_SECRET + "&";
    recaptcha_url += "response=" + req.body["g-recaptcha-response"] + "&";
    recaptcha_url += "remoteip=" + req.connection.remoteAddress;
    Request(recaptcha_url, function(error, resp, body) {
        body = JSON.parse(body);
        if(body.success !== undefined && !body.success) {
            req.flash("passerr","Captcha Validation Failed!!!")
            // console.log("captcha validation falied");
  res.redirect("/register");
        }
        else{

if(req.body.password == req.body.password1){

  var newUser = new User({
    username : req.body.username,
    firstname: req.body.firstname,
    lastname: req.body.lastname,
    confirmed: false,
    fullname: req.body.firstname + " " + req.body.lastname
    
 });

console.log(newUser);

var transporter = nodemailer.createTransport({
    service: "Gmail",
    auth: {
        user: "StoreHimster@gmail.com",
        pass: "lhmbxxsxoolshsrf"
    }
});
var mailOptions,link;

  host=req.get('host');
  link="https://himster.in/verify?id="+rand+"&gmail="+req.body.username;
  mailOptions={
    to : req.body.username,
    subject : "Confirm your email address",
    html : `<h3 style="font-family:sans-serif; ">Welcome to HIMSTER, ${req.body.firstname}.</h3><p style="font-family:sans-serif; ">You're receiving this message because you recently signed up for a Himster account.</p><p style="font-family:sans-serif; ">Confirm your email address by clicking on the button below.This step adds extra security to your account by verifying you own this email.</p><a href="${link}" style="padding: 8px 14px;border:1px solid black;color:white;font-weight:500;background-color: black;text-decoration: none;border-radius:5px;margin-bottom: 15px;">Confirm email</a><br><p style="font-family:sans-serif; border-top: 1px solid black;border-bottom: 1px solid black;padding: 20px 0px;margin: 20px 0px;"> This link will expire in 5 minutes.</p> <small style="float:right;">© 2022 Himster All Rights Reserved.</small>`
  }
  // console.log(mailOptions);
  transporter.sendMail(mailOptions, function(error, response){
     if(error){
          // console.log(error);
          res.render(__dirname+ "/views/wrongpg");
   }
});

  User.register(newUser, req.body.password, function(err, user){
    if (err) {
      // console.log(err);
      req.flash('regerr',['Registration Failed!!!','A User with given email already exists.'])
      res.redirect("/register");
    } else {
      passport.authenticate("local")(req, res, function(){
        req.flash('info','An email has been sent to your email account...Please verify your account');
        res.redirect("/register");
      });
    }
  });
}
else
{
  console.log("your password do not match");
  req.flash("passerr","Registration Failed!!! Your passwords do not match....Please try again by entering same passwords.")
  res.redirect("/register");
}


        }

    });


});

app.get('/verify',function(req,res){
const  url = (req.url).split("=");
// console.log(url);
const usrname= url[2];
// console.log(usrname);

if(true)
{
  if(req.query.id==rand)
  {
    User.updateOne({username: usrname},{confirmed: true},(err)=>{
      if(err){
        // console.log(err)
        res.render(__dirname+ "/views/wrongpg");
      }
      else
      {
       // console.log("email is verified");
       req.flash("emailverification",['Registration Successful!!!','Email verification Successful.']);
       res.redirect("/");

      }
    })
    
  }
  else
  {
    console.log("email is not verified");
    res.send("email verification failed");
    
  }
}
else
{
  res.end("<h1>Request is from unknown source");
}
});

app.get("/emailverification",(req,res)=>{
  let usr= {};
  let authentication= false;
  if(req.isAuthenticated()){
    usr= req.user;
    if(usr.confirmed){
    authentication= true;
  }
  else
  {
    authentication= false;
  }
  
  }
  else{
    authentication= false;
  }
  res.render(__dirname + "/views/emailverification",{usr: usr, authentication: authentication});

});

app.post("/emailverification",(req,res)=>{
  // console.log(req.body.username);
  var transporter = nodemailer.createTransport({
    service: "Gmail",
    auth: {
        user: "StoreHimster@gmail.com",
        pass: "lhmbxxsxoolshsrf"
    }
});
var mailOptions,link;

  host=req.get('host');
  link="https://himster.in/verify?id="+rand+"&gmail="+req.body.username;
  mailOptions={
    to : req.body.username,
    subject : "Confirm your email address",
    html : `<h3 style="font-family:sans-serif; ">Welcome to HIMSTER.</h3><p style="font-family:sans-serif; ">You're receiving this message because you recently signed up for a Himster account.</p><p style="font-family:sans-serif; ">Confirm your email address by clicking on the button below.This step adds extra security to your account by verifying you own this email.</p><a href="${link}" style="padding: 8px 14px;border:1px solid black;color:white;font-weight:500;background-color: black;text-decoration: none;border-radius:5px;margin-bottom: 15px;">Confirm email</a><br><p style="font-family:sans-serif; border-top: 1px solid black;border-bottom: 1px solid black;padding: 20px 0px;margin: 20px 0px;"> This link will expire in 5 minutes.</p> <small style="float:right;">© 2022 Himster All Rights Reserved.</small>`
  }
  // console.log(mailOptions);
  transporter.sendMail(mailOptions, function(error, response){
     if(error){
          // console.log(error);
          res.render(__dirname+ "/views/wrongpg");
   }else{
          // console.log("Message sent Successfully ");
          req.flash('dgemail',['Email sent successfully!!!','Please verify your email.'])
          res.redirect("/login");

       }
});

});

app.post("/login", function(req, res){
// console.log(req.body);

User.findOne({username: req.body.username},(err,foundusr)=>{
  if(err){
    // console.log(err);
    res.render(__dirname+ "/views/wrongpg");
  }
  else
  {
    // console.log(foundusr);
    if(foundusr){
    if(foundusr.confirmed == true){
      const user = new User({
         username: req.body.username,
         password: req.body.password
       });
      
             req.login(user, function(err){
               if (err) {
                 console.log(err);

               } else {
                 passport.authenticate("local")(req, res, function(){
                 req.flash('login','Login Successful!!!');  
                res.redirect("/");
                 });
               }
       });


    }
    else
    {
      // console.log("something went wrong");
      req.flash("loginerr",['Login Failed!!!','Please make sure...You have verified your email address before trying again.'])
      res.redirect("/login");
    }

  }
  else
  {
    // console.log("this user doesn't exists");
    req.flash('usrdnexist','This Account does not exist');
    res.redirect("/login");
  }


  }
});
});


app.get("/logout", function(req, res){
  req.logout();
  req.flash('logout','Logged-out Successfully!!!')
  res.redirect("/");
});

// add new address page
app.get("/add_address",(req,res)=>{

  let usr= {};
  let authentication= false;
  if(req.isAuthenticated()){
    usr= req.user;
    if(usr.confirmed){
    authentication= true;
    
    // console.log(usr);
    if(usr.email){
    res.render(__dirname+ "/views/addaddress",{usr: usr,authentication: authentication});
      }
      else
      {
        res.redirect("/update-profile");
      }
     }
     else
     {
      res.redirect("/login");
     }


  }
  else{
    
    res.redirect("/login");
  
  }
});

app.post("/add_address",(req,res)=>{
  // console.log(req.body);
  address.find({email: req.body.usrmail},(err,found)=>{
    if(err){
      // console.log(err);
      res.render(__dirname+ "/views/wrongpg");
    }
    else
    {
      // console.log(found.length);
      if(found.length < 2){
        const add= {
          email: req.body.usrmail,
          firstname: req.body.firstname,
          lastname: req.body.lastname,
          fullname: req.body.firstname + " " + req.body.lastname,
          town: req.body.town,
          address: req.body.address,
          city: req.body.city,
          pincode: req.body.pincode,
          state: req.body.state,
          phone: req.body.phone,
          typeofaddress: req.body.typeofaddress

        };
        console.log("Customer address : ",add);
        address.create(add,(err)=>{
          if(err){
            // console.log(err)
            res.render(__dirname+ "/views/wrongpg");
          }
          else
          {
            // console.log("address addedd Successfully");
            req.flash("message",'New address added successfully!!!');
            res.redirect("/address");
          }
        })
      }
      else
      {
        // console.log("you can not add more than 3 address");
        req.flash('message','You can not add more than three address.')
        res.redirect("/address");
      }
    }
  });
});

// address page
app.get("/address",(req,res)=>{

  let usr= {};
  let authentication= false;
  if(req.isAuthenticated()){
    usr= req.user;
    if(usr.confirmed){

    authentication= true;
    
    if(usr.email){
    address.find({email: usr.email},(err,foundadd)=>{
      if(foundadd.length > 0){
      res.render(__dirname+ "/views/address",{ message: req.flash('message') ,foundadd: foundadd, usr: usr,authentication: authentication});

      }
      else
      {
        res.render(__dirname+ "/views/address",{message: req.flash('message'),usr: usr,authentication: authentication,foundadd: 0});
    
      }
    })

    }
    else
    {
      res.redirect("/update-profile");
    }
  }
  else{
    res.redirect("/login");
  }

  }
  else{
    
    res.redirect("/login");
  
  }
});


app.post("/deleteaddress",(req,res)=>{
  // console.log(req.body.userid);
  address.deleteOne({_id: req.body.userid},(err)=>{
    if(err){
      // console.log(err);
      res.render(__dirname+ "/views/wrongpg");
    }
    else
    {
      // console.log("address deleted Successfully");
      req.flash('message','Address Deleted Successfully!!!')
      res.redirect("/address");
    }
  })

})

app.get("/blogs/:blogtitle",(req,res)=>{
  // console.log(req.params.blogtitle);

  let usr= {};
  let authentication= false;
  if(req.isAuthenticated()){
    
    usr= req.user;
    if(usr.confirmed){
      authentication= true;
    }
    else
    {
      authentication= false;
    }
  }
  else{
    authentication= false
  
  }

  if("SmartphoneHolder" == req.params.blogtitle){
       res.render(__dirname+ "/views/blog-single1",{usr: usr, authentication: authentication});

  }else{

  blog.findOne({blog_title: req.params.blogtitle},(err,foundblog)=>{
    if(err){
      // console.log(err);
      res.render(__dirname+ "/views/wrongpg");
      
    }
    else{
       // console.log(foundblog)
      res.render(__dirname+ "/views/blog-single",{foundblog: foundblog,usr: usr, authentication: authentication});
    }
  });

}

});

// add new product section
app.get("/add_products_step1",(req,res)=>{

  let usr= {};
  let authentication= false;
  if(req.isAuthenticated()){
    
    usr= req.user;
    if(usr.confirmed && (usr.email == 'storehimster@gmail.com')){
      authentication= true;
      res.render(__dirname + "/views/upload-products",{usr: usr,authentication: authentication});

    }
    else
    {
      res.render(__dirname + "/views/404");
    }
  }
  else{
    res.redirect("/login");
  
  }
  
});


app.post("/add_products_step1",(req,res)=>{
  // console.log(req.body); 
  // console.log(req.file);
  product.create({prod_title: req.body.name, prod_subtitle: req.body.subtitle, prod_cat: req.body.category, prod_originalprice: req.body.oringinalprice, prod_discountedprice: req.body.discountedprice, prod_desc: req.body.desc, prod_color: req.body.color, prod_img1: req.file.path, prod_img2: " ", prod_img3: " " },function(err,small){
    if(err){
      // console.log(err);
      res.render(__dirname+ "/views/wrongpg");
    }
    else{
      res.render(__dirname + "/views/upload-products2",{name:req.body.name, subtitle: req.body.subtitle, cat: req.body.category, oringinalprice: req.body.oringinalprice, discountedprice: req.body.discountedprice, desc: req.body.desc, color: req.body.color});
    }
  });
});

app.post("/add_products_step2",(req,res)=>{
  // console.log(req.body); 
  // console.log(req.file);
  product.updateOne({prod_title: req.body.name},{prod_img2: req.file.path},function(err){
    if(err){
      // console.log(err);
      res.render(__dirname+ "/views/wrongpg");
    }
    else{
      console.log("successfully updated the product");
      res.render(__dirname + "/views/upload-products3",{name:req.body.name, subtitle: req.body.subtitle, cat: req.body.category, oringinalprice: req.body.oringinalprice, discountedprice: req.body.discountedprice, desc: req.body.desc, color: req.body.color});
    
    }
  })

});

app.post("/add_products_step3",(req,res)=>{
  // console.log(req.body); 
  // console.log(req.file);
    product.updateOne({prod_title: req.body.name},{prod_img3: req.file.path},function(err){
    if(err){
      // console.log(err);
      res.render(__dirname+ "/views/wrongpg");
    }
    else{
      console.log("successfully updated the product");
      req.flash("msg","One new product added successfully!!!");
      res.redirect("/admin/myproducts");
    }
  })

  

});

// all blogs

app.get("/blogs",(req,res)=>{
  // res.render(__dirname+ "/views/blog-full-width");

  let usr= {};
  let authentication= false;
  if(req.isAuthenticated()){
    usr= req.user;
    if(usr.confirmed){
      authentication= true;
    }
    else
    {
      authentication= false;
    }
  }
  else{
    authentication= false
  
  }
  blog.find({},(err,allblogs)=>{
    if(err){
      // console.log(err);
      res.render(__dirname+ "/views/wrongpg");
    
    }
    else{
      // console.log(allblogs);
      res.render(__dirname+ "/views/blog-full-width",{allblogs : allblogs,usr: usr, authentication: authentication});
    }
  })
});



// cart page
app.get("/cart",(req,res)=>{

  let usr= {};
  let authentication= false;
  if(req.isAuthenticated()){
    usr= req.user;
    if(usr.confirmed){
    authentication= true;
    
    Cart.findOne({userId: usr._id},(err,foundcart)=>{
      if(err){
        console.log(err);
      }
      else
      {
      if(foundcart){
           res.render(__dirname+ "/views/cart",{delcart: req.flash('delcart'), addcart: req.flash('addcart') ,foundcart: foundcart.products  ,usr: usr,authentication: authentication});
       
      }
      }
    })

}
else
{
  console.log("/login");
}
    
  }
  else{
    authentication= false;
    res.redirect("/login");
  
  }
});


app.post("/cart",(req,res)=>{
 const addcart= {
        productId: req.body.productId,
        quantity: Number(req.body.quantity),
        name: req.body.name,
        desc: req.body.desc,
        img: req.body.img,
        price: req.body.price,
        ttlprice: Number(req.body.quantity) * Number(req.body.price)
      };
    const userId = req.body.userId; //TODO: the logged in user id

      Cart.findOne({userId: req.body.userId},(err,cartt)=>{
          if(err){
            // console.log(err);
            res.render(__dirname+ "/views/wrongpg");
          }
          else
          { 
             // console.log(cartt);
             // console.log(cartt.products);
             if(cartt){
                    let itemIndex = cartt.products.findIndex(p => p.productId == req.body.productId);
                      console.log(itemIndex);
                 if (itemIndex > -1) {
                   //product exists in the cart, update the quantity
                   let productItem = cartt.products[itemIndex];
                   productItem.quantity = productItem.quantity + 1;
                   productItem.ttlprice = productItem.quantity * productItem.price;
                   cartt.products[itemIndex] = productItem;
                 } else {
                   //product does not exists in cart, add new item
                   cartt.products.push(addcart);
                 }
                 cartt = cartt.save();
                 req.flash("addcart","One Item added in your cart successfully!!!");
                 res.redirect("/cart");
               }
               else
               {
                Cart.create({userId: req.body.userId, products: addcart},(err)=>{
                if(err){
                  console.log(err);
                }
                else
                {
                  console.log("cart created Successfully");
                  req.flash("addcart","One Item added in your cart successfully!!!");
                 
                  res.redirect("/cart");
                }
              });
               }
          }
  }); 
});



app.post("/subone",(req,res)=>{
    const userId = req.body.userId; //TODO: the logged in user id

      Cart.findOne({userId: req.body.userId},(err,cartt)=>{
          if(err){
            // console.log(err);
            res.render(__dirname+ "/views/wrongpg");
          }
          else
          { 
             // console.log(cartt);
             // console.log(cartt.products);
             if(cartt){
                    let itemIndex = cartt.products.findIndex(p => p.productId == req.body.productId);
                      console.log(itemIndex);
                 if (itemIndex > -1) {
                   //product exists in the cart, update the quantity
                   let productItem = cartt.products[itemIndex];
                   productItem.quantity = productItem.quantity - 1;
                   productItem.ttlprice = productItem.quantity * productItem.price;
                   cartt.products[itemIndex] = productItem;
                 } else {
                   //product does not exists in cart, add new item
                   cartt.products.push(addcart);
                 }
                 cartt = cartt.save();
                 req.flash("addcart","One Item added in your cart successfully!!!");
                 res.redirect("/cart");
               }
               else
               {
                Cart.create({userId: req.body.userId, products: addcart},(err)=>{
                if(err){
                  // console.log(err);
                  res.render(__dirname+ "/views/wrongpg");
                }
                else
                {
                  // console.log("cart created Successfully");
                  req.flash("addcart","One Item deleted from your cart successfully!!!");
                 
                  res.redirect("/cart");
                }
              });
               }
          }
  }); 
});

app.post("/profile",(req,res)=>{
  // console.log(req.file);
  User.updateOne({_id: req.body.profile},{profile: (req.file.path).slice(7)},(err)=>{
    if(err){
      console.log(err);
    }
    else
    {
      req.flash("smsg","Profile Image Updated Successfully!!!");
      res.redirect("/profile-details");
    }
  });
});

app.get("/checkout/:userId",(req,res)=>{
  // console.log(req.params.userId);
  let usr= {};
  let authentication= false;
  if(req.isAuthenticated){
    authentication= true;
    usr= req.user;

if(usr.address && usr.email){
    if(req.params.userId == req.user._id){

  Cart.findOne({userId: req.params.userId},(err,foundcart)=>{
      if(err){
        // console.log(err);
        res.render(__dirname+ "/views/wrongpg");
      }
      else
      {
        // console.log(foundcart.products);
        res.render(__dirname+ "/views/checkout",{usr: usr,authentication: authentication,foundcart: foundcart.products});

    }
  });

}
else
{
  res.send("Bad request");
}
}
else
{
  res.redirect("/update-profile");
}


}
else
{
  res.redirect("/login");
}

  
});

app.get("/coming_soon",(req,res)=>{

  let usr= {};
  let authentication= false;
  if(req.isAuthenticated()){
    usr= req.user;
    if(usr.confirmed){
      authentication= true;
    }
    else
    {
      authentication= false;
    }

  }
  else{
    authentication= false;
  
  }
  res.render(__dirname+ "/views/coming-soon",{usr: usr,authentication: authentication});
});


app.get("/admin/add_review/:prodname",(req,res)=>{
  // console.log(req.params.prodname);
  let usr= {};
  let authentication= false;
  if(req.isAuthenticated()){
    
    usr= req.user;
    if(usr.confirmed && (usr.email == 'storehimster@gmail.com')){
      authentication= true;
    res.render(__dirname+"/views/admin_addreview",{prodname: req.params.prodname,usr: usr, authentication: authentication});
    }
    else{
      res.render(__dirname + "/views/404");
    }

  }
  else{
    res.redirect("/login");
  
  }

});

app.post("/admin/pr",(req,res)=>{
  // console.log(req.body);
  // console.log((req.file.path).slice(7));
  const arr = (req.body.date).split("-");
  var months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  let month= months[Number(arr[1])-1]
  console.log(month);
  pr.create({title: req.body.prodname,star: req.body.rating , name: req.body.usrname, year: arr[0], month : month, day: arr[2], time: req.body.time, review: req.body.review, img: (req.file.path).slice(7)},(err)=>{
    if(err){
      // console.log(err);
      res.render(__dirname+ "/views/wrongpg");
    }
    else
    {
      console.log("review published Successfully");
      res.redirect("/products/"+req.body.prodname);
    }
  })  
  
});

app.get("/editaddress/:addid",(req,res)=>{

  let usr= {};
  let authentication= false;
  if(req.isAuthenticated()){
    
    usr= req.user;
    if(usr.confirmed){
    authentication= true;
    res.render(__dirname+ "/views/editaddress",{usr: usr,authentication: authentication,addid: req.params.addid});
  }
  else{
    res.redirect("/login");
  }
  }
  else{
    res.redirect("/login");
  
  }
});


app.post("/editaddress",(req,res)=>{
  // console.log(req.body);
  
        
  address.updateOne({_id: req.body.addid},{
          firstname: req.body.firstname,
          lastname: req.body.lastname,
          town: req.body.town,
          address: req.body.address,
          city: req.body.city,
          pincode: req.body.pincode,
          state: req.body.state,
          typeofaddress: req.body.typeofaddress

        },(err)=>{
    if(err){
      // console.log(err);
      res.render(__dirname+ "/views/wrongpg");
    }
    else
    {
      // console.log("Address edited Successfully");
      req.flash('message','Address edited Successfully!!!');
      res.redirect("/address");
    }
  });
});




app.get("/femailverification",(req,res)=>{

  let usr= {};
  let authentication= false;
  if(req.isAuthenticated()){
  
    usr= req.user;
    if(usr.confirmed){

    authentication= true;
    }
    else{
      authentication= false;
    }
  }
  else{
    authentication= false;
  }
  res.render(__dirname + "/views/femailverification",{usr: usr, authentication: authentication});

});


app.post("/femailverification",(req,res)=>{

  // console.log(req.body.username);
  var transporter = nodemailer.createTransport({
    service: "Gmail",
    auth: {
        user: "StoreHimster@gmail.com",
        pass: "lhmbxxsxoolshsrf"
    }
});
var mailOptions,link;

  host=req.get('host');
  link="https://himster.in/verification?id="+rand+"&gmail="+req.body.username;
  mailOptions={
    to : req.body.username,
    subject : "Password reset link",
    html : `<h3 style="font-family:sans-serif; ">Welcome to HIMSTER.</h3><p style="font-family:sans-serif; ">You're receiving this message because you recently reqested for a reset password for your Himster account.</p><p style="font-family:sans-serif; ">To reset your password click on the button below.</p><a href="${link}" style="padding: 8px 14px;border:1px solid black;color:white;font-weight:500;background-color: black;text-decoration: none;border-radius:5px;margin-bottom: 15px;">Reset Password</a><br><p style="font-family:sans-serif; border-top: 1px solid black;border-bottom: 1px solid black;padding: 20px 0px;margin: 20px 0px;"> This link will expire in 5 minutes.</p> <small style="float:right;">© 2022 Himster All Rights Reserved.</small>`
  }
   console.log(mailOptions);
  transporter.sendMail(mailOptions, function(error, response){
     if(error){
           console.log(error);
          res.render(__dirname+ "/views/wrongpg");
   }else{
          // console.log("Message sent Successfully ");
          req.flash('fgmail',['Email sent successfully!!!','Please check your inbox and reset password after email verification']);
          res.redirect("/login");

          // res.redirect("/forget-pass-reset");
  
       }
});

});



app.get('/verification',function(req,res){
// console.log(req.query.id);
// console.log(rand);
// console.log(req.protocol+"://"+req.get('host'));
const  url = (req.url).split("=");
// console.log(url);
const usrname= url[2];
// console.log(usrname);
let usr= {};
  let authentication= false;
  if(req.isAuthenticated()){
    
    usr= req.user;

    if(usr.confirmed){
      authentication= true;
    }
    else{
      authentication= false;
    }
  }
  else{
    authentication= false;
  
  }

if(true)
{
  console.log("Domain is matched. Information is from Authentic email");
  if(req.query.id==rand)
  {
    User.updateOne({username: usrname},{confirmed: true},(err)=>{
      if(err){
        // console.log(err)
        res.render(__dirname+ "/views/wrongpg");
      }
      else
      {
       // console.log("email is verified");
       req.flash('fverification',['Email verification Successful!!!','Please enter your new password.']);
       res.render(__dirname+ "/views/forget-pass-reset",{msg: req.flash('fverification') ,usr: usr, authentication: authentication  ,username: usrname});

      }
    })
    
  }
  else
  {
    console.log("email is not verified");
    res.send("email verification failed!!!");
    
  }
}
else
{
  res.end("<h1>Request is from unknown source");
}
});


app.post("/forget-pass-reset",(req,res)=>{
  // console.log(req.body);
    if(req.body.pass1 == req.body.pass2){

User.findOne({username: req.body.username },function(err,found){
      if(err){
        // console.log(err)
        res.render(__dirname+ "/views/wrongpg");
      }
      else{

     User.findById(found._id, function(err, user) {
    user.setPassword(req.body.pass1, function(err) {
        if (err){
          // console.log(err)
          res.render(__dirname+ "/views/wrongpg");
        }
        user.save(function(err) {
            if (err){
              // console.log(err)
              res.render(__dirname+ "/views/wrongpg");
            } else{

                // console.log("password changed Successfully");
                req.flash('passsuccess','Password changed successfully!!!');
            res.redirect("/login");
            }
        });
    });
});


         }
    });

}
else{
  res.redirect("/forget-pass-reset");
}

});


app.get("/order-details/:orderid",(req,res)=>{
  // console.log(req.params.orderid)

  let usr= {};
  let authentication= false;
  if(req.isAuthenticated()){
    
    usr= req.user;
    if(usr.confirmed){
    authentication= true;

     Order.find({owner: usr._id},(err,foundorders)=>{
      if(err){
        // console.log(err);
        res.render(__dirname+ "/views/wrongpg");
      }else{
        if(!foundorders){
          res.redirect("/cart");
        }
        else{
           // console.log(foundorders);

    res.render(__dirname+ "/views/order-details",{orderidd: req.params.orderid,item: foundorders,usr: usr,authentication: authentication});

        }

      }
        
   });

    }
    else{
      res.redirect("/login");
    }

  }
  else{
    res.redirect("/login");
  
  }
  
});

app.get("/order",(req,res)=>{

  let usr= {};
  let authentication= false;
  if(req.isAuthenticated()){
    
    usr= req.user;
    if(usr.confirmed){
    authentication= true;
    Order.find({owner: usr._id},(err,foundorders)=>{
      if(err){
        // console.log(err);
        res.render(__dirname+ "/views/wrongpg");
      }else{
        if(!foundorders){
          res.redirect("/cart");
        }
        else{
        
           // console.log(foundorders);
        res.render(__dirname+ "/views/order",{ item: foundorders,usr: usr,authentication: authentication});

        }

      }
    })


  }
  else{
    res.redirect("/login");
  }
  }
  else{
    res.redirect("/login");
  
  }
});

app.get("/product-ratings",(req,res)=>{

  let usr= {};
  let authentication= false;
  if(req.isAuthenticated()){
    
    usr= req.user;
    if(usr.confirmed){

    authentication= true;
    res.render(__dirname+ "/views/product-ratings",{usr: usr,authentication: authentication});
  }
  else{
    res.redirect("/login");
  }
  }
  else{
    res.redirect("/login");
  
  }
});


app.post("/product-ratings",(req,res)=>{

 // console.log(req.body);
 let img='';
 if(req.body.image){
  img= req.body.image;
 }
 else{
  img= req.body.profile;
 }

 var months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  let d= new Date();
  let year= d.getFullYear();
  let month= months[d.getMonth()];
  let day= d.getDate();
  let tm= (d.getHours()) + ":" + d.getMinutes() ;
  pr.create({title: req.body.prodname,star: req.body.rating , name: req.body.name, year:year , month : month, day: day, time: tm, review: req.body.text, img: img},(err)=>{
    if(err){
      // console.log(err);
      res.render(__dirname+ "/views/wrongpg");
    }
    else
    {
      // console.log("review published Successfully");
      res.redirect("/products/"+req.body.prodname);
    }
  })



});



app.post("/prod_ratings",(req,res)=>{

// console.log(req.body);


  let usr= {};
  let authentication= false;
  if(req.isAuthenticated()){
    
    usr= req.user;
    if(usr.confirmed){

    authentication= true;
   res.render(__dirname+ "/views/product-ratings",{authentication: authentication, usr: usr  ,img: req.body.img, name: req.body.name, desc: req.body.desc, total: req.body.total, fullname: req.body.fullname, email: req.body.email });

  }
  else{
    res.redirect("/login");
  }
  }
  else{
    res.redirect("/login");
  
  }
});


// app.post("/product-ratings",(req,res)=>{

// })


app.get("/products/:prodname",(req,res)=>{

  let usr= {};
  let authentication= false;
  if(req.isAuthenticated()){
    
    usr= req.user;
    if(usr.confirmed){
    authentication= true;
  }
  else{
    authentication= false;
  }
  }
  else{
    authentication= false;
  
  }
  let reviews= [];
  pr.find({title: req.params.prodname},(err,reviews)=>{
    if(err){
      // console.log(err);
      res.render(__dirname+ "/views/wrongpg");
    }
    else
    {
      // console.log(reviews);
product.findOne({prod_title: req.params.prodname},(err,foundproduct)=>{
    if(err){
      // console.log(err);
      res.render(__dirname+ "/views/wrongpg");
    }
    else
    {
      // console.log(foundproduct);
      product.find({prod_cat: foundproduct.prod_cat},(err,relatedproducts)=>{
        if(err){
          // console.log(err);
          res.render(__dirname+ "/views/wrongpg");
        }
        else
        {
          // console.log(relatedproducts);
          // console.log(foundproduct);
          // console.log(reviews);
          res.render(__dirname+ "/views/product-single",{review: reviews , usr:usr, authentication: authentication, foundproduct: foundproduct, relatedproducts: relatedproducts});
    
        }
      });
    }
  });
  
    }
  });



  
});




app.get("/profile-details",(req,res)=>{

  let usr= {};
  let authentication= false;
  if(req.isAuthenticated()){
    usr= req.user;
    if(usr.confirmed){
    authentication= true;
    
    res.render(__dirname+ "/views/profile-details",{smsg: req.flash('smsg') ,usr: usr,authentication: authentication});
  }
  else{
    res.redirect("/login");
  }
  }
  else{
    res.redirect("/login");
  
  }

});


// reset password area
app.get("/reset-password",(req,res)=>{

  let usr= {};
  let authentication= false;
  if(req.isAuthenticated()){
    usr= req.user;

    if(usr.confirmed){
    authentication= true
    res.render(__dirname+ "/views/reset-password",{smsg: req.flash('smsg'), errmsg: req.flash('errmsg') ,usr: usr,authentication: authentication});
  }
  else{
    res.redirect("/login");
  }
  }
  else{
    res.redirect("/login");
  
  }
});

app.post("/reset-password",(req,res)=>{

    
if(req.isAuthenticated()){  

  let user1= req.user;
  if(req.body.new1 == req.body.new2){
  
  User.findOne({username: user1.username },function(err,found){
        if(err){
          // console.log(err);
          req.flash("errmsg","Password or username is incorrect");
          res.redirect("/reset-password");
        }
        else{
  
               User.findById(found._id, function(err, user) {
      user.changePassword(req.body.old,req.body.new1, function(err) {
          if (err){
            // console.log(err);
            req.flash("errmsg","Password or username is incorrect!!!");
            res.redirect("/reset-password");
          }
          else{
            console.log("password updated Successfully");
            req.flash("smsg",'Password Updated Successfully!!!')
            res.redirect("/profile-details");
        }
      });
  });
  
  
           }
      });
  
  }
  else{

  req.flash("errmsg","Failed!!! Both Passwords do not match");
    res.redirect("/reset-password");
  }
  
  
}
else{
  res.redirect("/login");
}



});


app.post("/deletereview",(req,res)=>{
  const prodname= req.body.prodname;
  pr.deleteOne({_id: req.body.reviewid},(err)=>{
    if(err){
      // console.log(err);
      res.render(__dirname+ "/views/wrongpg");
    }
    else
    {
      // console.log("review deleted Successfully");
      res.redirect("/products/"+req.body.prodname);
    }

  })
})


app.post("/instock",(req,res)=>{

  product.updateOne({_id: req.body.prodid},{instock: false},(err)=>{
    if(!err){
      res.redirect("/admin/myproducts")
    }
  });

});

app.post("/outstock",(req,res)=>{

  product.updateOne({_id: req.body.prodid},{instock: true},(err)=>{
    if(!err){
      res.redirect("/admin/myproducts")
    }
  });

});



// admin all products routes
app.get("/admin/myproducts",(req,res)=>{
  let usr= {};
  let authentication= false;
  if(req.isAuthenticated()){
    usr= req.user;
    
    if(usr.confirmed  && (usr.email == 'storehimster@gmail.com')){

    authentication= true;
    
    product.find({},(err,foundproducts)=>{

      if(err){
        // console.log(err);
        res.render(__dirname+ "/views/wrongpg");
      }
      else
      {
      res.render(__dirname+ "/views/admin_allproducts",{msg: req.flash('msg'),foundproducts: foundproducts ,usr:usr, authentication: authentication,  foundproducts: foundproducts, cat: req.params.prodcategory});
    

      }
    });



}
else
{
  res.render(__dirname + "/views/404");
}
        

  }
  else{
    res.redirect("/login");
  
  }
  
});


app.post("/admin/deleteproduct",(req,res)=>{
  // console.log(req.body);
  product.deleteOne({_id: req.body.prodid},(err)=>{
    if(err){
      // console.log(err);
      res.render(__dirname+ "/views/wrongpg");
    }
    else
    {
      // console.log("Product Deleted Successfully");
      req.flash("msg","Product Deleted Successfully!!!");
      res.redirect("/admin/myproducts");
    }
  });
});

// admin all products routes
app.get("/admin/myblogs",(req,res)=>{
  let usr= {};
  let authentication= false;
  if(req.isAuthenticated()){
    
    usr= req.user;
    if(usr.confirmed && (usr.email == 'storehimster@gmail.com')){
      authentication= true;
    blog.find({},(err,foundblogs)=>{

      if(err){
        // console.log(err);
        res.render(__dirname+ "/views/wrongpg");
      }
      else
      {
      res.render(__dirname+ "/views/admin_myblogs",{message: req.flash("message") ,foundblogs: foundblogs ,usr:usr, authentication: authentication});
    

      }
    });

  }
  else{
    res.render(__dirname + "/views/404");
  }

  }
  else{
    
    res.redirect("/login");
  
  }
  
});


app.post("/admin/deleteblog",(req,res)=>{
  // console.log(req.body);
  blog.deleteOne({_id: req.body.blogid},(err)=>{
    if(err){
      // console.log(err);
      res.render(__dirname+ "/views/wrongpg");
    }
    else
    {
      // console.log("blog deleted Successfully");
      req.flash("message","Blog Deleted Successfully!!!");
      res.redirect("/admin/myblogs");
    }
  });
});


app.get("/admin/editproduct/:prodtitle",(req,res)=>{
let usr={};
let authentication= false;
if(req.isAuthenticated){
  usr= req.user;
  if(usr.confirmed && (usr.email == 'storehimster@gmail.com')){
    authentication= true;
    // console.log(req.params.prodtitle);
    product.findOne({prod_title: req.params.prodtitle},(err,found)=>{
      if(err){
        // console.log(err);
        res.redirect("/admin/editproduct/"+ req.body.prodtitle);

      }
      else
      {
        // console.log(found);
        res.render(__dirname+ "/views/admin_editproduct",{found: found});
      }
    });
  }
  else{
    res.render(__dirname + '/views/404');
  }

}
else
{
  res.redirect("/login");
}

});

app.post("/admin/editproduct",(req,res)=>{
  // console.log(req.body.prodid);
  const updateprod= {
    prod_title: req.body.name,
    prod_subtitle: req.body.subtitle,
    prod_cat: req.body.category,
    prod_originalprice: req.body.oringinalprice,
    prod_discountedprice: req.body.discountedprice,
    prod_desc: req.body.desc,
    prod_color: req.body.color

  };
  product.updateOne({_id: req.body.prodid},updateprod,(err)=>{
    if(err){
      // console.log(err);
      res.render(__dirname+ "/views/wrongpg");
    }
    else
    {
      
      // console.log("product edited Successfully");
      req.flash("msg","Product Edited Successfully!!!")
      res.redirect("/admin/myproducts");
    }
  });
});


app.get("/admin/editblog/:blogtitle",(req,res)=>{
  let usr={};
let authentication= false;
if(req.isAuthenticated){
  usr= req.user;
  if(usr.confirmed && (usr.email == 'storehimster@gmail.com')){
    authentication= true;
    // console.log(req.params.blogtitle);
    blog.findOne({blog_title: req.params.blogtitle},(err,found)=>{
      if(err){
        // console.log(err);
        res.render(__dirname+ "/views/wrongpg");
      }
      else
      {
        // console.log(found);
        res.render(__dirname+ "/views/admin_editblog",{found: found});
      }
    });
  }
  else{
    res.render(__dirname + "/views/404");
  }
}
else{
  res.redirect("/login");
}

});

app.post("/admin/editblog",(req,res)=>{
   // console.log(req.body);
  const updateblog= {
    blog_title: req.body.title,
    blog_desc1: req.body.desc1,
    blog_desc2: req.body.desc2,
    blog_desc3: req.body.desc3,
    
  };
  blog.updateOne({_id: req.body.blogid},updateblog,(err)=>{
    if(err){
      // console.log(err);
      res.render(__dirname+ "/views/wrongpg");
    }
    else
    {
      
      console.log("Blog edited Successfully");
      req.flash("message","Blog Edited Successfully!!!");
      res.redirect("/admin/myblogs");
    }
  });
});





app.get("/shop/:prodcategory",(req,res)=>{

  let usr= {};
  let authentication= false;
  if(req.isAuthenticated()){
    
    usr= req.user;
    if(usr.confirmed){
      authentication= true;
    }
    else{
      authentication= false;
    }
  }
  else{
    authentication= false;
  
  }
  
  // console.log(req.params.prodcategory);
  if(req.params.prodcategory == "New" || req.params.prodcategory == "Gimbal" || req.params.prodcategory == "Accessories"){
  
    
  if(req.params.prodcategory == "New"){
    product.find({},(err,foundproducts)=>{
      if(err){
        // console.log(err);
        res.render(__dirname+ "/views/wrongpg");
      }
      else{
        // console.log(foundproducts);
        res.render(__dirname+ "/views/shop-all-accessories",{usr:usr, authentication: authentication,  foundproducts: foundproducts, cat: req.params.prodcategory});
          
      }
      
    })
          

  }
  else{
        product.find({prod_cat: req.params.prodcategory},(err,fnd)=>{
          if(err){
            // console.log(err);
            res.render(__dirname+ "/views/wrongpg");
            
          }
          else{
          
            res.render(__dirname+ "/views/shop-all-accessories",{usr: usr, authentication: authentication, foundproducts: fnd, cat: req.params.prodcategory});
          }
        });
    }

  }

  else{
    res.send("invalid category");
  }
  
  
  
});


app.get("/shop",(req,res)=>{
  // res.render(__dirname+ "/views/shop");

  let usr= {};
  let authentication= false;
  if(req.isAuthenticated()){
    
    usr= req.user;
    if(usr.confirmed){
      authentication= true;
    }
    else{
      authentication= false;
    }
  }
  else{
    authentication= false;
  
  }
  product.find({},(err,shopproducts)=>{
    if(err){
      // console.log(err);
      res.render(__dirname+ "/views/wrongpg");
    }
    else
    {
      // console.log(shopproducts);
      res.render(__dirname+ "/views/shop",{usr: usr, authentication: authentication, shopproducts: shopproducts});
    }
  })
});


app.get("/update-profile",(req,res)=>{

  let usr= {};
  let authentication= false;
  if(req.isAuthenticated()){
    
    usr= req.user;
    if(usr.confirmed = true){
    authentication= true;
    res.render(__dirname+ "/views/update-profile",{usr: usr,authentication: authentication});
    }
    else
    {
      res.redirect("/login");
    }

  }
  else{
    authentication= false;
    res.redirect("/login");
  
  }
  
});


app.post("/update-profile",(req,res)=>{
  // console.log(req.body);
  const updtusr= {
    firstname: req.body.firstname,
    lastname: req.body.lastname,
    fullname: req.body.firstname + " " + req.body.lastname, 
    email: req.body.email,
    phone: req.body.phone,
    gender: req.body.gender,
    address : req.body.address,
    town: req.body.town,
    city: req.body.city,
    pincode: req.body.pincode,
    state: req.body.state,
    typeofaddress: req.body.typeofaddress

  };

  User.updateOne({_id: req.body.usrname},updtusr,(err)=>{
    if(err){
      // console.log(err);
      res.render(__dirname+ "/views/wrongpg");
    }
    else
    {
      // console.log("profile updated successfully");
      req.flash('smsg','Profile Updated Successfully!!!');
      res.redirect("/profile-details");
    }
  })

  
});


app.get("/wishlist",(req,res)=>{

  let usr= {};
  let authentication= false;
  if(req.isAuthenticated()){
    usr= req.user;
    if(usr.confirmed == true){
      authentication= true;
    
    wishlist.findOne({userId: usr._id},(err,foundwishlist)=>{
      if(err){
        console.log(err);
      }
      else
      {
        if(foundwishlist){
          res.render(__dirname+ "/views/wishlist",{delmsg: req.flash('delmsg') ,smsg: req.flash('smsg'),foundwishlist: foundwishlist.wishlists ,usr: usr,authentication: authentication});  
        }    
      }
    })

    }
    else
    {
      res.redirect("/login");
    }
  }
  else{
    res.redirect("/login");
  
  }
});



app.post("/wishlist",(req,res)=>{
 const addwishlist= {
        productId: req.body.productId,
        name: req.body.name,
        desc: req.body.desc,
        img: req.body.img,
        price: req.body.price
      };
   const userId = req.body.userId; 

      wishlist.findOne({userId: req.body.userId},(err,wishlst)=>{
          if(err){
            // console.log(err);
            res.render(__dirname+ "/views/wrongpg");
          }
          else
          { 
            // console.log(wishlst);
             if(wishlst){
                    let itemIndex = wishlst.wishlists.findIndex(p => p.productId == req.body.productId);
                      console.log(itemIndex);
                 if (itemIndex > -1) {
                  console.log("this product is already in your wishlist");
                  req.flash("smsg",'this product already exists in your wishlist');
                  res.redirect("/wishlist");
            
                  } else {
                   //product does not exists in cart, add new item
                   wishlst.wishlists.push(addwishlist);
                   wishlst = wishlst.save();
                 req.flash("smsg",'One Item added in your wishlist successfully!!!');
                 res.redirect("/wishlist");
            
                 }
                 
               }
               else
               {
                wishlist.create({userId: req.body.userId, wishlists: addwishlist},(err)=>{
                if(err){
                  // console.log(err);
                  res.render(__dirname+ "/views/wrongpg");
                }
                else
                {
                // console.log("wishlist created Successfully");
                 req.flash("smsg",'One Item added in your wishlist successfully!!!');
             res.redirect("/wishlist");

                }
              });

               }
          }
  }); 


});


app.post("/deletewishlist",(req,res)=>{
  // console.log(req.body);
  wishlist.findOne({userId: req.body.userId},(err,found)=>{
    if(err){
      console.log(err);
    }
    else
    {
      // console.log(found);
let itemIndex = found.wishlists.findIndex(p => p._id == req.body.productId);
        found.wishlists.splice(itemIndex,1);
        found= found.save();
        req.flash("delmsg","One Item deleted from your wishlist successfully!!!");
        res.redirect("/wishlist");
              

    }
  })
})


app.post("/deletecart",(req,res)=>{
  // console.log(req.body);
  Cart.findOne({userId: req.body.userId},(err,found)=>{
    if(err){
      // console.log(err);
      res.render(__dirname+ "/views/wrongpg");
    }
    else
    {
      // console.log(found);
let itemIndex = found.products.findIndex(p => p._id == req.body.productId);
        found.products.splice(itemIndex,1);
        found= found.save();
        req.flash("delcart","One Item deleted from your cart successfully!!!");
        res.redirect("/cart");
              

    }
  })
})

app.get("/update",(req,res)=>{
  product.find({},(err,found)=>{
    if(!err){
      console.log(found);
      for(i in found){
        found[i].instock= true;
        found[i].save();
      }
    }
    res.send("updated");
  });
});







// routes

app.use(require('./routes/main'))

// route for page not found

app.use((req,res,next)=>{
  res.status(404).render(__dirname+ "/views/404");
})

var server = app.listen();
server.setTimeout(500000);

app.listen(3000, function() {
  console.log("Server started on port 3000.");
});
