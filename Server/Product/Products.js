const db = require("../connect.js");

async function addProduct(productDetails) {
  const {
    category_id,
    product_name,
    product_description,
    seller_id,
    product_price,
  } = productDetails;
  const query = `INSERT INTO products (category_id, product_name, product_description, seller_id, product_price) 
                   VALUES (?, ?, ?, ?, ?)`;
  const params = [
    category_id,
    product_name,
    product_description,
    seller_id,
    product_price,
  ];
  try {
    const result = await db.execute(query, params);
    return result;
  } catch (error) {
    console.error(error);
    return error;
  }
}

async function deleteProduct(product_id) {
  try {
    let sql = `
    delete from products where product_id =?;
    `;
    let values = [product_id];
    const [result] = await db.execute(sql, values);
    //console.log(result);
    return result;
  } catch (err) {
    console.error(err);
    return err;
  }
}

async function updateProductDetails(
  product_id,
  category_id,
  product_name,
  product_description,
  product_price
) {
  try {
    let sql = `
    update products set category_id = ?,product_name = ?,product_description =?,product_price=? where product_id =?;
    `;
    let values = [
      category_id,
      product_name,
      product_description,
      product_price,
      product_id,
    ];
    const [result] = await db.execute(sql, values);
    console.log(result);
    return result;
  } catch (err) {
    console.error(err);
    return err;
  }
}

async function getProductDetails(product_id) {
  try {
    let sql = `
    SELECT * FROM products WHERE product_id = ?;
    `;
    let values = [product_id];
    const [result] = await db.execute(sql, values);
    //console.log(result[0]);
    return result[0];
  } catch (err) {
    return err;
  }
}
module.exports = {
  addProduct,
  deleteProduct,
  updateProductDetails,
  getProductDetails,
};
