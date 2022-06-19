const router = require('express').Router()
const path= require('path')
const nodemailer = require('nodemailer');

// about us page
router.get("/about",(req,res)=>{

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
  res.render( "about",{usr: usr,authentication: authentication});
});



router.get("/FAQs",(req,res)=>{

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
  res.render( "FAQs",{usr: usr,authentication: authentication});
});


router.get("/TermsOfUse",(req,res)=>{

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
  res.render( "termsofuse",{usr: usr,authentication: authentication});
});


router.get("/RefundPolicy",(req,res)=>{

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
  res.render( "refundPolicy",{usr: usr,authentication: authentication});
});



router.get("/ShippingPolicy",(req,res)=>{

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
  res.render("shippingPolicy",{usr: usr,authentication: authentication});
});



router.get("/X",(req,res)=>{

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
  res.render("isteadyX",{usr: usr,authentication: authentication});
});

router.get("/Pro3",(req,res)=>{

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
  res.render("isteadyPro3",{usr: usr,authentication: authentication});
});

router.get("/Mobplus",(req,res)=>{

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
  res.render("iSteadyMobilePlus",{usr: usr,authentication: authentication});
});

router.get("/Multi",(req,res)=>{

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
  res.render("iSteadyMulti",{usr: usr,authentication: authentication});
});

router.get("/Gear",(req,res)=>{

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
  res.render("iSteadyGear",{usr: usr,authentication: authentication});
});



router.get("/PrivacyPolicy",(req,res)=>{

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
  res.render( "privacypolicy",{usr: usr,authentication: authentication});
});



// router.get("/purchase-confirmations",(req,res)=>{

//   let usr= {};
//   let authentication= false;
//   if(req.isAuthenticated()){
//     usr= req.user;
//     if(usr.confirmed){
//     authentication= true
//     res.render( "purchase-confirmations",{usr: usr,authentication: authentication});
//   }
//   else{
//     res.redirect("/login");
//   }
//   }
//   else{
//     res.redirect("/login");
  
//   }
// });


router.get("/order_confirmation",(req,res)=>{

  let usr= {};
  let authentication= false;
  if(req.isAuthenticated()){
    
    usr= req.user;
    if(usr.confirmed){
      authentication= true;
      res.render("confirmation",{usr: usr,authentication: authentication});
    }
    else{
      res.redirect("/login");
    }
  }
  else{
    res.redirect("/login");
  
  }
  
});





module.exports= router
