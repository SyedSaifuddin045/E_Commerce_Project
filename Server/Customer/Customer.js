const bcrypt = require("bcrypt");

class Customer {
  constructor(
    customer_name,
    customer_address,
    customer_phone,
    customer_email,
    customer_password,
    customer_pincode
  ) {
    this.customer_name = customer_name;
    this.customer_address = customer_address;
    this.customer_phone = customer_phone;
    this.customer_email = customer_email;

    this.customer_pincode = customer_pincode;
    return new Promise((resolve, reject) => {
      bcrypt.hash(customer_password, 10, (err, hash) => {
        if (err) {
          reject(err);
        }
        this.customer_password = hash;
        resolve(this);
      });
    });
  }
}

module.exports = { Customer };
