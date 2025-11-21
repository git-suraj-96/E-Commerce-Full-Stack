const mongoose = require('mongoose');


const productSchema = new mongoose.Schema(
  {
    description: {
      type: String,
    },
    price: {
      type: Number,
    },
    category: {
      type: String,
    },
    productImage : {
        type : String
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Product", productSchema);

