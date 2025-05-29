const express = require("express");
const axios = require("axios");
const cors = require("cors");
const mongoose = require("mongoose");

const app = express();
app.use(cors());
app.use(express.json());
//db connection
mongoose
  .connect(
    "mongodb+srv://VishalnathKrishnaSA:Paladinspes@cluster0.ffevusb.mongodb.net/Shoebay"
  )
  .then(() => console.log("db connected"))
  .catch((err) => console.log(err));
//schema
const allProductsSchema = new mongoose.Schema({
  id: Number,
  name: String,
  price: String,
  tags: Array,
  img: String,
  brand: String,
});
const cartProductsSchema = new mongoose.Schema({
  id: Number,
  name: String,
  price: String,
  size: Number,
  img: String,
  qty: Number,
  uId: String,
});
const orderProductsSchema = new mongoose.Schema({
  name: String,
  price: String,
  products:Array,
  address: String,
  mobileNumber:Number,
  uId:String

});

const loginDetailsSchema = new mongoose.Schema({
  email: String,
  uId: String,
  name:String
});

//model creation.........................................................

const allProducts = mongoose.model("allproduct", allProductsSchema);
const cartProducts = mongoose.model("cartproduct", cartProductsSchema);
const orderProducts = mongoose.model("orderproduct", orderProductsSchema);
const loginDetails = mongoose.model("logindetails", loginDetailsSchema);
//user details.......................................login details..........................
app.post("/api/logindetails/signup", async (req, res) => {
  const user = loginDetails.findOne(req.body.uId);

  try {
    const newUser = new loginDetails({
      email: req.body.email,
      uId: req.body.uId,
      name:req.body.name
    });
    const user = await newUser.save();
    res.status(200).json(user);
  } catch (err) {
    res.status(500).json({ message: "unable to add", err: err.message });
  }
});

app.get("/api/logindetails", async (req, res) => {
  try {
    const users = await loginDetails.find();
    res.send(users);
  } catch (err) {
    res.send("Unable to get users data");
  }
});

//getting all proucts ..................products collection......................
app.get("/api/productsData", async (req, res) => {
  try {
    const products = await allProducts.find();
    res.send(products);
  } catch {
    res.send("Unable to get the data");
  }
});
//......................cart collection...................................................
//fetchng cart prodct
app.get("/api/cartproducts", (req, res) => {
  cartProducts.find().then((data) => {
    res.send(data);
  });
});
//adding new product to cart
app.post("/api/cartproducts", async (req, res) => {
  ///checking for duplicate
  const existing = await cartProducts.findOne({
    id: req.body.id,
    size: req.body.size,
    uId: req.body.uId,
  });
  if (existing) {
    res.status(401).json({ message: "Already added to the cart" });
  } else {
    const product = new cartProducts({
      id: req.body.id,
      name: req.body.name,
      price: req.body.price,
      size: req.body.size,
      img: req.body.img,
      qty: Number(req.body.qty),
      uId: req.body.uId,
    });
    try {
      const cartProduct = await product.save();
      res.status(201).json(cartProduct);
    } catch (err) {
      res.status(500).json(err);
    }
  }
});
// increasing the qty...............................
app.patch("/api/cartproducts/incqty/:id", async (req, res) => {
  try {
    const cartProduct = await cartProducts.findById(req.params.id);
    if (!cartProduct) {
      return res.status(404).json("Product not found in cart");
    }
    //increasing the count
    const updateProduct = await cartProducts.findByIdAndUpdate(
      req.params.id,
      { $inc: { qty: 1 } },
      { new: true }
    );
    res.status(200).json(updateProduct);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Unable to inc the qty", err: err.message });
  }
});
//decreasing the qty..............................................
app.patch("/api/cartproducts/decqty/:id", async (req, res) => {
  try {
    const cartProduct = await cartProducts.findById(req.params.id);
    if (!cartProduct) {
      res.status(404).json(" product not found in cart");
    }

    //decrease
    const updateProduct = await cartProducts.findByIdAndUpdate(
      req.params.id,
      { $inc: { qty: -1 } },
      { new: true }
    );
    res.status(200).json(updateProduct);
  } catch (err) {
    res.status(500).json({ message: "unable to decrease", err: err.message });
  }
});

//deleting the product
app.patch("/api/cartproducts/deleteproduct/:id", async (req, res) => {
  try {
    const cartProduct = await cartProducts.findById(req.params.id);
    console.log(cartProduct.name);
    if (!cartProduct) {
      res.status(404).json("Product not found");
    }
    await cartProduct.deleteOne();
    res.status(200).json({ message: "deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "unable to delete", err: err.message });
  }
});

//orering products
app.post("/api/orderproducts",async (req,res)=>{
    try{
        const newOrder=  new orderProducts({
            name: req.body.name,
            price: req.body.price,
            products:req.body.products,
            address: req.body.address,
            mobileNumber:req.body.mobileNumber,
            uId:req.body.uId

        })
        const order=await newOrder.save()
        res.status(200).json(order)

    }catch(err){
      res.status(500).json({message:"unable to place order",err:err.message})
    }

})

app.get("/test", (req, res) => {
  console.log("wrking");
});

app.listen(5000, (req, res) => {
  console.log("srvr started");
});
