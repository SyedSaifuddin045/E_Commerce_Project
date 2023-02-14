const db = require("../connect.js");

async function addProductImage(image_id, product_id, image_url, public_id) {
  const query = `INSERT INTO product_images (image_id,product_id, image_url,public_id) 
                   VALUES (?,?, ? ,?)`;
  const params = [image_id, product_id, image_url, public_id];
  try {
    const result = await db.execute(query, params);
    return result;
  } catch (error) {
    console.error(error);
    return error;
  }
}

async function getImagePublicId(image_id, product_id) {
  try {
    let sql = `
    select public_id from product_images where image_id =? and product_id = ?;
    `;
    let values = [image_id, product_id];
    const result = await db.execute(sql, values);
    //const publicId = result[0][0].public_id;
    //console.log(publicId);
    return result;
  } catch (err) {
    return err;
  }
}

async function deleteProductImage(image_id, product_id) {
  try {
    const sql = `
  delete from product_images where product_id=? and image_id =?;
  `;
    const values = [product_id, image_id];
    const [result] = await db.execute(sql, values);
    //console.log(result);
    return result;
  } catch (err) {
    console.log(err);
    return err;
  }
}

async function getProductImages(product_id) {
  try {
    const sql = `
  select image_id,image_url,public_id from product_images where product_id = ?; 
  `;
    const values = [product_id];
    const [result] = await db.execute(sql, values);
    //console.log(result);
    return result;
  } catch (err) {
    return err;
  }
}
module.exports = {
  addProductImage,
  deleteProductImage,
  getProductImages,
  getImagePublicId,
};
