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
});
const orderProductsSchema = new mongoose.Schema({
  id: Number,
  name: String,
  price: String,
  qty: Number,
  size: Number,
  address: String,
});

//model creation.........................................................

const allProducts = mongoose.model("allproduct", allProductsSchema);
const cartProducts = mongoose.model("cartproduct", cartProductsSchema);
const orderProducts = mongoose.model("orderproduct", orderProductsSchema);
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
    const existing= await cartProducts.findOne({
      id:req.body.id,
      size:req.body.size
    })
    if(existing){
        res.status(401).json({message:"Already added to the cart"})
    }else{
         const product = new cartProducts({
    id: req.body.id,
    name: req.body.name,
    price: req.body.price,
    size: req.body.size,
    img: req.body.img,
    qty: Number(req.body.qty),
  });
  try {
    const cartProduct = await product.save();
    res.status(201).json(cartProduct);
  } catch (err) {
    res.status(400).json(err );
    
  }
    }
 
});
// increasing the qty...............................
app.patch("/api/cartproducts/incqty/:id", async (req, res) => {
  try {
    
    const cartProduct = await cartProducts.findById(req.params.id);
    if (!cartProduct) {
      return res.status(404).json("Product not found in cart");}
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
app.patch("/api/cartproducts/deleteproduct/:id",async(req,res)=>{
  try{
      const cartProduct=await cartProducts.findById(req.params.id)
      console.log(cartProduct.name)
    if(!cartProduct){
      res.status(404).json("Product not found")
    }
    await cartProduct.deleteOne()
    res.status(200).json({message:"deleted successfully"})
  }catch(err){
    res.status(500).json({message:"unable to delete",err:err.message})
  }
    
})

app.get("/test", (req, res) => {
  console.log("wrking");
});

app.listen(5000, (req, res) => {
  console.log("srvr started");
});
