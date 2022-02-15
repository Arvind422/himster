const mongoose= require("mongoose");
const passportLocalMongoose = require("passport-local-mongoose");

const paymentSchema = new mongoose.Schema({
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

module.exports = new mongoose.model("payment", paymentSchema);
