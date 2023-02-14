require("dotenv").config();
const express = require("express");
const app = express();
app.use(express.json());

const Customer_Router = require("./Customer/CustomerRouting.js");
app.use("/customer", Customer_Router);

const Categories_Router = require("./Categories/CategoriesRouting.js");
app.use("/categories", Categories_Router);

const Seller_Router = require("./Seller/SellerRouting.js");
app.use("/seller", Seller_Router);

const Product_Routing = require("./Product/ProductRouting.js")
app.use("/products",Product_Routing);

app.listen(process.env.PORT, () => {
  console.log("Server started at " + process.env.PORT);
});
