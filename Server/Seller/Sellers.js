const connection = require("../connect.js");
const bcrypt = require("bcrypt");
class Seller {
  static async Add(seller_name, seller_phone, seller_email, seller_password) {
    try {
      let sql = `
        insert into seller(seller_name,seller_phone,seller_email,seller_password) values (?,?,?,?);
        `;
      let values = [seller_name, seller_phone, seller_email, seller_password];
      //let hased_password = await bcrypt.hash(seller_password, 10);
      //console.log(hased_password);
      let result = await connection.execute(sql, values);
      return result[0].insertId;
    } catch (err) {
      console.log("Failed to insert into seller" + err);
      return "Failed to insert into seller" + err;
    }
  }

  static async Find(seller_id) {
    try {
      let sql = `
      SELECT
      seller_id,
      seller_name,
      seller_phone,
      seller_email
      FROM
      seller
      WHERE
      seller_id =?;
        `;
      let values = [seller_id];
      const [result] = await connection.execute(sql, values);
      console.log(result[0]);
      return result[0];
    } catch (err) {
      return { message: "Error Occured :" + err };
    }
  }

  static async Delete(seller_id, seller_email, seller_password) {
    try {
      let sql = `
    Select seller_password from seller where seller_id = ? and seller_email = ? ;
    `;
      let values = [seller_id, seller_email];
      const [result] = await connection.execute(sql, values);
      return await new Promise((resolve, reject) => {
        bcrypt.compare(
          seller_password,
          result[0].seller_password,
          async (err, same) => {
            if (err) reject(err);
            if (same) {
              sql = `
    Delete from seller where seller_id = ? and seller_email = ?; 
    `;
              const values = [seller_id, seller_email];
              const [result] = await connection.execute(sql, values);
              console.log(result.affectedRows);
              resolve(result.affectedRows);
            } else {
              resolve({ Success: "false", message: "Passwords do not match!" });
            }
          }
        );
      });
    } catch (err) {
      return { message: "Error Occured = " + err };
    }
  }

  static async UpdateDetails(
    seller_id,
      seller_name,
      seller_phone,
      seller_password
  ) {
    try {
      let checkSql = `
        SELECT seller_password FROM seller WHERE seller_id = ?;
      `;
      let checkValues = [seller_id];
      var [checkResult] = await connection.execute(checkSql, checkValues);
      if (checkResult.length === 0) {
        throw new Error("seller not found");
      }
      let storedPassword = checkResult[0].seller_password;
      let isMatch = await bcrypt.compare(seller_password, storedPassword);
      if (!isMatch) {
        throw new Error("Password does not match");
      }
      let sql = `
        UPDATE seller
        SET
        seller_name = ?,
        seller_phone = ?,
        WHERE seller_id = ?;
      `;
      let values = [
      seller_name,
      seller_phone,
      seller_id
      ];
      var [result] = await connection.execute(sql, values);
      return result.affectedRows;
    } catch (err) {
      console.log(err);
      throw err;
    }
  }

  static async UpdateEmail(seller_id, seller_email, seller_new_email) {
    let sql = `select * from seller where seller_email = ?`;
    let values = [seller_new_email];
    let [result] = await connection.execute(sql, values);
    if (result[0]) return result[0];
    else {
      sql = `update seller set seller_email = ? where seller_id = ? and seller_email = ?;`;
      values = [seller_new_email, seller_id, seller_email];
      const [new_result] = await connection.execute(sql, values);
      return new_result.affectedRows;
    }
  }

  static async ChangePassword(
    seller_id,
    seller_password,
    seller_new_password
  ) {
    let sql = `
      Select seller_password from seller where seller_id = ? ;
    `;
    let values = [seller_id];
    const [result] = await connection.execute(sql, values);
    return await new Promise((resolve, reject) => {
      bcrypt.compare(
        seller_password,
        result[0].seller_password,
        async (err, same) => {
          if (err) {
            reject(err);
          } else {
            if (same) {
              try {
                let hash = await bcrypt.hash(seller_new_password, 10);
                sql = `UPDATE seller SET seller_password = ? WHERE seller_id = ?`;
                values = [hash, seller_id];
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

module.exports = Seller;
