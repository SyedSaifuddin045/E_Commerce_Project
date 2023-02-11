const connection = require("./../connect.js");
const bcrypt = require("bcrypt");

class Customers {
  static async Add(C) {
    try {
      const sql = `
        Insert into customer
        (customer_name,customer_address,customer_phone,customer_email,customer_password,customer_pincode)
         values (?,?,?,?,?,?);
        `;
      const values = [
        C.customer_name,
        C.customer_address,
        C.customer_phone,
        C.customer_email,
        C.customer_password,
        C.customer_pincode,
      ];

      const result = await connection.execute(sql, values);
      console.log(result[0].insertId);
      return result[0].insertId;
    } catch (err) {
      console.log("Failed to insert " + err);
      return "Failed to insert " + err;
    }
  }
  static async Delete(customer_id, customer_email, customer_password) {
    let sql = `
    Select customer_password from customer where customer_id = ? and customer_email = ? ;
    `;
    let values = [customer_id, customer_email];
    const [result] = await connection.execute(sql, values);
    return await new Promise((resolve, reject) => {
      bcrypt.compare(
        customer_password,
        result[0].customer_password,
        async (err, same) => {
          if (err) reject(err);
          if (same) {
            sql = `
    Delete from customer where customer_id = ? and customer_email = ?; 
    `;
            const values = [customer_id, customer_email];
            const [result] = await connection.execute(sql, values);
            console.log(result.affectedRows);
            resolve(result.affectedRows);
          } else {
            resolve({ Success: "false", message: "Passwords do not match!" });
          }
        }
      );
    });
  }
  static async Find(customer_id, customer_email, customer_password) {
    let sql = `
    Select customer_password from customer where customer_id = ? and customer_email = ? ;
    `;
    let values = [customer_id, customer_email];
    const [result] = await connection.execute(sql, values);
    return await new Promise((resolve, reject) => {
      bcrypt.compare(
        customer_password,
        result[0].customer_password,
        async (err, same) => {
          if (err) reject(err);
          if (same) {
            sql = `SELECT 
          customer_name,
          customer_address,
          customer_phone,
          customer_email,
          customer_pincode 
          FROM customer WHERE 
          customer_id = ? AND customer_email = ?`;
            values = [customer_id, customer_email];
            const [result] = await connection.execute(sql, values);
            resolve(result[0]);
          } else {
            resolve({ Success: "false", message: "Passwords do not match!" });
          }
        }
      );
    });
  }
  static async UpdateDetails(
    customer_id,
    customer_name,
    customer_address,
    customer_phone,
    customer_pincode,
    customer_password
  ) {
    try {
      let checkSql = `
        SELECT customer_password FROM customer WHERE customer_id = ?;
      `;
      let checkValues = [customer_id];
      var [checkResult] = await connection.execute(checkSql, checkValues);
      if (checkResult.length === 0) {
        throw new Error("Customer not found");
      }
      let storedPassword = checkResult[0].customer_password;
      let isMatch = await bcrypt.compare(customer_password, storedPassword);
      if (!isMatch) {
        throw new Error("Password does not match");
      }
      let sql = `
        UPDATE customer
        SET
         customer_name = ?,customer_address=?,customer_phone=?,customer_pincode=?  
        WHERE customer_id = ?;
      `;
      let values = [
        customer_name,
        customer_address,
        customer_phone,
        customer_pincode,
        customer_id,
      ];
      var [result] = await connection.execute(sql, values);
      return result.affectedRows;
    } catch (err) {
      console.log(err);
      throw err;
    }
  }

  static async UpdateEmail(customer_id, customer_email, customer_new_email) {
    let sql = `select * from customer where customer_email = ?`;
    let values = [customer_new_email];
    let [result] = await connection.execute(sql, values);
    if (result[0]) return result[0];
    else {
      sql = `update customer set customer_email = ? where customer_id = ? and customer_email = ?;`;
      values = [customer_new_email, customer_id, customer_email];
      const [new_result] = await connection.execute(sql, values);
      return new_result.affectedRows;
    }
  }
  static async ChangePassword(
    customer_id,
    customer_password,
    customer_new_password
  ) {
    let sql = `
      Select customer_password from customer where customer_id = ? ;
    `;
    let values = [customer_id];
    const [result] = await connection.execute(sql, values);
    return await new Promise((resolve, reject) => {
      bcrypt.compare(
        customer_password,
        result[0].customer_password,
        async (err, same) => {
          if (err) {
            reject(err);
          } else {
            if (same) {
              try {
                let hash = await bcrypt.hash(customer_new_password, 10);
                sql = `UPDATE customer SET customer_password = ? WHERE customer_id = ?`;
                values = [hash, customer_id];
                await connection.execute(sql, values);
                resolve({ Success: "true", message: "Password Updated" });
              } catch (e) {
                reject({ Success: "false", message: e });
              }
            } else {
              reject({ Success: "false", message: "Passwords do not match" });
            }
          }
        }
      );
    });
  }
}
module.exports = { Customers };
