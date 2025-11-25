require("dotenv").config();
var express = require("express");
const passport = require("passport");
var router = express.Router();
const localStrategy = require("passport-local");
const userModel = require("./users");
passport.use(new localStrategy(userModel.authenticate()));
const upload = require("./multer");
const productModel = require("./product");
const cartModel = require("./cart");
const { v4: uuidv4 } = require("uuid");

/* GET home page. */
router.get("/", function (req, res, next) {
  res.render("signup");
});

// register route
router.post("/register", function (req, res) {
  var userdata = new userModel({
    username: req.body.username,
    email: req.body.email,
    // role: 'admin'
  });
  userModel
    .register(userdata, req.body.password)
    .then(function (registeredUser) {
      passport.authenticate("local")(req, res, function () {
        let role = req.user.role;
        if (role === "admin") {
          res.redirect("/admin");
        } else if (role === "user") {
          res.redirect("/home");
        }
      });
    })
    .catch(function (err) {
      console.error(err);
      res.redirect("/");
    });
});

// make homepage route
router.get("/home", isLoggedIn, async function (req, res) {
  let products = await productModel.find({ category: "T-SHIRT" }).limit(4);
  let user = await userModel.findOne({ username: req.session.passport.user });
  let cartItems = user.cartItems;
  res.render("index", { products, cartItems });
});

router.post("/home", async (req, res) => {
  try {
    let category = req.body.category;

    if (!category) {
      return res.json({
        success: false,
        error: "Category not found",
      });
    }

    let products = null;

    if (category === "ALL PRODUCTS") {
      products = await productModel.aggregate([
        { $sort: { _id: 1 } },
        {
          $group: {
            _id: "$category",
            product: { $first: "$$ROOT" },
          },
        },
        { $limit: 4 },
        { $replaceRoot: { newRoot: "$product" } },
      ]);
    } else {
      products = await productModel.find({ category }).limit(4);
    }

    return res.json({
      success: true,
      products,
    });
  } catch (err) {
    return res.json({
      success: false,
      error: err.toString(),
    });
  }
});

// make login router
router.post(
  "/login",
  passport.authenticate("local", {
    failureRedirect: "/login",
    failureFlash: true,
  }),
  function (req, res) {
    let userRole = req.user.role;

    if (userRole === "admin") {
      res.redirect("/admin");
    } else if (userRole === "user") {
      res.redirect("/home");
    }
  }
);

// get login page
router.get("/login", function (req, res) {
  let failureMessage = req.flash("error");
  res.render("login", { error: failureMessage });
});

// make logout route
router.get("/logout", function (req, res, next) {
  req.logOut(function (err) {
    if (err) return next(err);
    res.redirect("/login");
  });
});

// it will check user is login or not
function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect("/login");
}

// make a route which will open admin page
router.get("/admin", function (req, res) {
  let success = req.flash("success");
  if (success[0] === undefined) {
    success[0] = false;
  }
  res.render("admin", { success: success[0] });
});

router.get('/adminorder', async function(req, res){
  try{
   const admin = await userModel
  .findOne({ username: req.session.passport.user })
  .populate({
    path: "adminOrder",
    populate: {
      path: "productId",   // nested populate
    },
  });

    const orders = await admin.adminOrder;
    res.render("adminorder", {orders});
  }catch(err){
    console.log(err);
  }
})

// upload image name on upload folder
router.post(
  "/upload-image",
  isLoggedIn,
  upload.single("file"),
  async (req, res, next) => {
    try {
      if (!req.file) return res.status(400).send("No file chosen");

      if (!req.session.passport || !req.session.passport.user)
        return res.status(401).send("User not logged in");

      const { description, price, category } = req.body;
      const user = await userModel.findOne({
        username: req.session.passport.user,
      });

      const product = await productModel.create({
        description,
        price,
        category,
        productImage: req.file.filename,
        createdBy: user._id,
      });

      user.products.push(product._id);
      await user.save();

      if (product._id) {
        req.flash("success", true);
      }

      res.redirect("/admin");
    } catch (err) {
      console.error(err);
      res.json({
        success: false,
        error: "Internal server ERROR",
      });
    }
  }
);

// router for opening product page
router.get("/productpage/:category", async (req, res) => {
  try {
    let category = req.params.category;
    let user = await userModel.findOne({ username: req.session.passport.user });
    let cartItems = user.cartItems;

    let products = null;
    if (category === "TOP DEALS") {
      products = await productModel.find({ price: { $lte: 700 } });
    } else if (category === "allproducts") {
      products = await productModel.find();
    } else {
      products = await productModel.find({ category: category });
    }
    res.render("product-page", { products, cartItems });
  } catch (err) {
    console.error(err);
  }
});

// open product in cart
router.get("/products/:description", async (req, res) => {
  let description = req.params.description;
  let product = await productModel.findOne({ description: description });
  const user = await userModel.findOne({ username: req.session.passport.user });
  let cartItems = user.cartItems;

  res.render("product-detail-page", { product, cartItems });
});

// router that will add item to cart
router.post("/addtocart", async (req, res) => {
  try {
    const productId = req.body.productId;
    if (!productId) {
      return res.json({
        success: false,
        error: "Product Id not found",
      });
    }

    const user = await userModel.findOne({
      username: req.session.passport.user,
    });
    user.cartItems.push(productId);
    await user.save();

    return res.json({
      success: true,
      message: "Items added succesfully",
    });
  } catch (err) {
    return res.json({
      success: false,
      error: err,
    });
  }
});

// router that will open cart
router.get("/cart", async (req, res) => {
  try {
    const username = req.session.passport.user;
    let user = await userModel
      .findOne({ username: username })
      .populate("cartItems");
    let totalPrice = 0;

    for (let val of user.cartItems) {
      totalPrice += val.price;
    }

    let cartItems = user.cartItems;

    res.render("cart-page", { cartItems, totalPrice });
  } catch (err) {
    console.log(err);
  }
});

// delete cart item
router.post("/deletecartitem", async (req, res) => {
  const itemId = req.body.itemId;
  try {
    if (!itemId) {
      return res.json({
        success: false,
        error: "Item id not found",
      });
    }

    let user = await userModel.findOne({ username: req.session.passport.user });
    user.cartItems.splice(user.cartItems.indexOf(itemId), 1);
    await user.save();

    user = await userModel
      .findOne({ username: req.session.passport.user })
      .populate("cartItems");

    const remainingItem = user.cartItems;

    let allPrice = 0;

    for (let val of remainingItem) {
      allPrice += val.price;
    }

    return res.json({
      success: true,
      message: "Item deleted succesfully.",
      cartlength: remainingItem.length,
      totalPrice: allPrice,
    });
  } catch (err) {
    return res.json({
      success: false,
      error: `"Something went wrong", ErrorType: +${err}`,
    });
  }
});

// search
router.get("/search/:query", async function (req, res) {
  try {
    let query = req.params.query;
    if (!query) return;

    query = query.replaceAll("tshirt", "t-shirt");

    const queryWords = query.split(" ");

    const products = await productModel.find();

    let result = [];

    for (let product of products) {
      let matchedAll = true;

      for (let word of queryWords) {
        let regex = new RegExp(word, "i");

        if (!regex.test(product.description)) {
          matchedAll = false;
          break;
        }
      }

      if (matchedAll) {
        result.push(product);
      }
    }

    const cartItems = await cartModel.find();

    res.render("product-page", { products: result, cartItems });
  } catch (err) {
    console.error(err);
  }
});

// open checkout page
router.get("/checkoutpage", async function (req, res) {
  try {
    const user = await userModel
      .findOne({ username: req.session.passport.user })
      .populate("cartItems");
    const cartItems = user.cartItems;

    let subtotal = 0;

    for (let val of cartItems) {
      subtotal += val.price;
    }

    res.render("checkoutpage", { cartItems, subtotal });
  } catch (err) {
    console.log(err);
  }
});

// get confirmation page
router.get("/orderConfirmation4564587123853212836489798", async function (req, res) {
  try{
    const user = await userModel.findOne({username : req.session.passport.user});
    const userOrder = await user.userOrder;
    res.render("orderconfirmationpage", {userOrder});

  }catch(err){
    console.log(err);
  }
});

// orderconfirmation
router.post("/confirmOrder", async (req, res) => {
  try {
    const {
      username,
      userMobileNo,
      userAdd,
      city,
      state,
      Pincode,
      country,
      payMethod,
    } = req.body;

    const fullAddress = {
      username,
      userMobileNo,
      userAdd,
      city,
      state,
      Pincode,
      country,
      payMethod,
    };

    const user = await userModel
      .findOne({ username: req.session.passport.user }).populate("cartItems");

    const cartItems = user.cartItems;
    let uniqueId = null;
    // console.log(user);
    for (let val of cartItems) {
      uniqueId = uuidv4();
      let admin = await userModel.findById(val.createdBy);
      admin.adminOrder.push({fullAddress, productId : val._id, orderId : uniqueId, orderStatus : "pending"});
      await admin.save();
    };

    for(let val of cartItems){
      user.userOrder.push({
        orderStatus : "pending",
        productId : val._id,
        orderId : uniqueId
      });
      await user.save();
    }

    user.cartItems = [];
    await user.save();

    return res.json({
      success: true,
      redirect: "/orderConfirmation4564587123853212836489798",
      customer : fullAddress
    });
  } catch (err) {
    return res.json({
      success: false,
      error: "Something went wrong" + err,
    });
  }
});

module.exports = router;
