const express = require("express");
const router = express.Router();

const Product = require("./Products.js");
const ProductImage = require("./Product_Images.js");

const multer = require("multer");
const path = require("path");
const fs = require("fs");
const cloudinary = require("../cloudinary.js");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "tmp/");
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + "-" + uniqueSuffix);
  },
});

const upload = multer({ storage: storage });

router.post("/new", upload.array("product_images", 10), async (req, res) => {
  try {
    const product = JSON.parse(req.body.product_details);
    let [result] = await Product.addProduct(product);
    const product_id = result.insertId;

    const promises = [];
    for (const file of req.files) {
      promises.push(
        new Promise(async (resolve, reject) => {
          const result = await cloudinary.uploader.upload(file.path, {
            folder: "products",
            use_filename: true,
          });
          resolve(result);
        })
      );
    }

    const Images = await Promise.all(promises);
    let image_id = 1;
    for (const image of Images) {
      const [result] = await ProductImage.addProductImage(
        image_id,
        product_id,
        image.secure_url,
        image.public_id
      );
      image_id++;
    }

    req.files.forEach((file) => {
      fs.unlink(file.path, (err) => {
        if (err) {
          console.error(err);
        }
      });
    });
    res.status(201).send({
      product_id: product_id,
      Success: "true",
      Message: "Suuccessfully Added Product!",
    });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .send({ Success: "false", Message: "Error Occured = " + err });
  }
});

router.get("/get_product/:id", async (req, res) => {
  try {
    const product_id = req.params.id;
    const result = await Product.getProductDetails(product_id);
    const images = await ProductImage.getProductImages(product_id);
    res.send({ product_details: result, product_images: images });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .send({ Success: "false", Message: "Error Occured = " + err });
  }
});

router.delete("/delete_image", async (req, res) => {
  try {
    const { image_id, product_id } = req.body;
    console.log("Image_id = " + image_id + "Product_id = " + product_id);

    // Check if the image_id and product_id were provided in the request body
    if (!image_id || !product_id) {
      return res.status(400).send({
        Success: "false",
        Message:
          "Please provide both image_id and product_id in the request body",
      });
    }

    // Get the public_id of the image to be deleted
    const P_ID = await ProductImage.getImagePublicId(image_id, product_id);
    if (!P_ID[0][0].public_id) {
      return res.status(400).send({
        Success: "false",
        Message:
          "The image with the provided image_id and product_id could not be found",
      });
    }

    // Delete the image from Cloudinary
    const cloudinary_response = await cloudinary.api.delete_resources(
      P_ID[0][0].public_id
    );

    if (cloudinary_response.deleted[P_ID[0][0].public_id] !== "deleted") {
      return res.status(500).send({
        Success: "false",
        Message:
          "An error occurred while trying to delete the image from Cloudinary",
      });
    }

    // Delete the image from the database
    const deleteFromTable = await ProductImage.deleteProductImage(
      image_id,
      product_id
    );
    if (deleteFromTable.affectedRows === 0) {
      return res.status(500).send({
        Success: "false",
        Message:
          "An error occurred while trying to delete the image from the database",
      });
    }

    res.send({
      Success: "true",
      Message: "Deletion of image successful",
    });
  } catch (err) {
    console.error(err);
    res.status(500).send({ Message: "Error Occurred: " + err });
  }
});

router.delete("/:product_id", async (req, res) => {
  const product_id = req.params.product_id;
  //get all details about images
  try {
    const Images = await ProductImage.getProductImages(product_id);
    //delete the images from cloudinary
    for (const image of Images) {
      //console.log(image);
      const cloudinary_response = await cloudinary.api.delete_resources(
        image.public_id
      );
      //if successfully deleted from cloudinary then delete their data from data base
      if (cloudinary_response.deleted[image.public_id] !== "deleted") {
        return res.status(500).send({
          Success: "false",
          Message:
            "An error occurred while trying to delete one of the images from Cloudinary",
        });
      }

      // If the image was successfully deleted from Cloudinary, delete it from the database
      const deleteFromTable = await ProductImage.deleteProductImage(
        image.image_id,
        product_id
      );
      if (deleteFromTable.affectedRows === 0) {
        return res.status(500).send({
          Success: "false",
          Message:
            "An error occurred while trying to delete one of the images from the database",
        });
      }
    }

    //delete all the product details from product table.
    const deleteFromProduct = await Product.deleteProduct(product_id);
    if (deleteFromProduct.affectedRows === 0) {
      return res.status(500).send({
        Success: "false",
        Message: "An error occurred while trying to delete the product",
      });
    }

    res.send({
      Success: "true",
      Message: "Deletion of product and its images successful",
    });
  } catch (err) {
    console.error(err);
    res.status(500).send({ Message: "Error Occurred: " + err });
  }
});

router.post("/add_image", async (req, res) => {});
module.exports = router;
