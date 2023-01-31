const connection = require("./../connect.js");

/**
 * This is a Static class to work with Categories and Database.
 */
class Categories {
  /**
   * This function add a category to database.
   * @param {Category} C - Object of type Category
   */
  static async Add(C) {
    const sql = `
        insert into categories(category_name,category_description)values(?,?)
        `;
    const values = [C.category_name, C.category_description];
    return connection
      .execute(sql, values)
      .then(([results]) => {
        //console.log(results.insertId);
        return results.insertId;
      })
      .catch((err) => {
        console.log(err);
        return undefined;
      });
  }
  static async Delete(category_name) {
    const sql = `delete from categories where category_name = ?`;
    const value = [category_name];
    const [result] = await connection.execute(sql, value);

    return result.affectedRows;
  }
  static async Update(C) {
    const sql = `
    update categories set category_description = ? where category_name = ?;
    `;
    const values = [C.category_description, C.category_name];
    const [result] = await connection.execute(sql, values);
    return result.affectedRows;
  }
  static async find(C) {
    try {
      const sql = `SELECT * FROM
        categories WHERE category_name = ?;`;
      const values = [C.category_name];
      const [result] = await connection.execute(sql, values);
      if (result.length) {
        return result[0];
      } else {
        throw new Error("Category not found");
      }
    } catch (err) {
      throw new Error(`Error while searching for category : \n` + err);
    }
  }
}

module.exports = { Categories };
