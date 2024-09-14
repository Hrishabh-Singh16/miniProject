const express = require("express");
const router = express.Router();
const Customer = require("../models/customers.js");
const ExpressError = require("../utils/ExpressError.js");
const wrapAsync = require("../utils/wrapAsync.js");




// Cart Page
router.get("", wrapAsync (async (req, res) => {
  let data = await Customer.findById("66e1cbc286cde24d097b1c08").populate("cart.itemId");
  let cusData = {
    id: data._id,
    name: data.name,
  };
  let cartItems = data.cart
  
  // res.render("cart.ejs", { cart: cartItems, cusData });
}));


// Adding Item in the cart
router.post("/:id", wrapAsync (async (req, res) => {
  let item = {
    itemId: req.params.id,
  };
  let customer = await Customer.findOne(
    {
      _id: "66e1cbc286cde24d097b1c08",
      "cart.itemId": req.params.id,
    },
    {
      "cart.$": 1,
    }
  );
  if (customer == null) {
    let result = await Customer.findOneAndUpdate(
      { _id: "66e1cbc286cde24d097b1c08" },
      { $push: { cart: item } }
    );
  } else {
    const cartItem = customer.cart[0];

    if (cartItem.quantity < 5) {
      const result = await Customer.updateOne(
        {
          _id: "66e1cbc286cde24d097b1c08",
          "cart.itemId": req.params.id,
        },
        {
          $inc: { "cart.$.quantity": 1 },
        }
      );
    }
  }
  res.redirect("/menu");
}));


// Decrease Quantity of item In the Cart
router.put("/s/:cusId/:itemId", wrapAsync (async (req, res) => {
  let { cusId, itemId: itemIdToUpdate } = req.params;
  let customer = await Customer.findOne(
    {
      _id: cusId,
      "cart._id": itemIdToUpdate,
    },
    {
      "cart.$": 1,
    }
  );

  if (customer && customer.cart.length > 0) {
    const cartItem = customer.cart[0];

    if (cartItem.quantity > 1) {
      const result = await Customer.updateOne(
        {
          _id: cusId,
          "cart._id": itemIdToUpdate,
        },
        {
          $inc: { "cart.$.quantity": -1 },
        }
      );
    } else {
      await Customer.updateOne(
        {
          _id: cusId,
        },
        {
          $pull: { cart: { _id: itemIdToUpdate } },
        }
      );
    }
  }

  res.redirect("/cart");
}));


// Increase Quantity of item In the Cart
router.put("/p/:cusId/:itemId", wrapAsync (async (req, res) => {
  let { cusId, itemId: itemIdToUpdate } = req.params;

  let customer = await Customer.findOne(
    {
      _id: cusId,
      "cart._id": itemIdToUpdate,
    },
    {
      "cart.$": 1,
    }
  );

  if (customer && customer.cart.length > 0) {
    const cartItem = customer.cart[0];

    if (cartItem.quantity < 5) {
      const result = await Customer.updateOne(
        {
          _id: cusId,
          "cart._id": itemIdToUpdate,
        },
        {
          $inc: { "cart.$.quantity": 1 },
        }
      );
    }
  }
  res.redirect("/cart");
}));

module.exports = router