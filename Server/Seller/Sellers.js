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

  static async Find(seller_id, seller_email, seller_password) {
    try {
      let sql = `
        Select seller_password from seller where seller_id = ? and seller_email = ?
        `;
      let values = [seller_id, seller_email];
      let [hased_password] = await connection.execute(sql, values);
      const same = await new Promise((resolve, reject) => {
        bcrypt.compare(
          seller_password,
          hased_password[0].seller_password,
          (err, result) => {
            if (err) return reject(err);
            return resolve(result);
          }
        );
      });
      if (same) {
        sql = `
            SELECT
            seller_id,
            seller_name,
            seller_phone,
            seller_email
            FROM
            seller
            WHERE
            seller_id =? AND seller_email =?;
            `;
        values = [seller_id, seller_email];
        const [result] = await connection.execute(sql, values);
        return result[0];
      } else {
        return { message: "Passwords do not match!" };
      }
    } catch (err) {
      return { message: "Error Occured :" + err };
    }
  }

  static 
}


module.exports = Seller;
