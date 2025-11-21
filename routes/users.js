const mongoose = require('mongoose');
const passportLocalMongoose = require('passport-local-mongoose');

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.log("DB Error:", err));

const userSchema = mongoose.Schema({
  userName : String,
  email : String,
  password : String,
  role : {
    type : String,
    default : "user"
  },
  products : [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
    }
  ],

  cartItems : [
    {
      type : mongoose.Schema.Types.ObjectId,
      ref : "Product",
    }
  ],

  order: [
  {
    fullAddress: {
      username: String,
      userMobileNo: String,
      userAdd: String,
      city: String,
      state: String,
      Pincode: String,
      country: String,
      payMethod: String,
    },

    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
    },

    orderId: String,

  }
]

  
});

userSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model("User", userSchema);