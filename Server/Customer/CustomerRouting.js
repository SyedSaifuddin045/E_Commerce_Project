const expess = require("express");
const router = expess.Router();

const { check, validationResult } = require("express-validator");

const { Customer } = require("./Customer.js");
const { Customers } = require("./Customers.js");

router.get("/", (req, res) => {
  res.send({
    message: "Customer Route.",
  });
});

router.post(
  "/new",
  [
    check("customer_name")
      .trim()
      .bail()
      .isLength({ min: 2, max: 25 })
      .withMessage("Customer Name must be atleast between 2 and 25"),
    check("customer_name")
      .trim()
      .bail()
      .matches(/^\S*\s\S*$/)
      .withMessage("Name must contain exactly one space"),
    check("customer_phone")
      .trim()
      .bail()
      .isLength({ min: 10 })
      .withMessage("Phone number must be greater than or equal to 10 digits"),
    check("customer_email")
      .trim()
      .bail()
      .isEmail()
      .withMessage("The provided Email is not valid!"),
    check("customer_password")
      .isLength({ min: 8 })
      .withMessage("Password must be at least 8 characters long"),
    check("customer_password")
      .matches(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/
      )
      .withMessage(
        "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character"
      ),
  ],
  async (req, res) => {
    try{
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }
    try {
      let {
        customer_name,
        customer_address,
        customer_phone,
        customer_email,
        customer_password,
        customer_pincode,
      } = req.body;
      var C = await new Customer(
        customer_name,
        customer_address,
        customer_phone,
        customer_email,
        customer_password,
        customer_pincode
      );
      //console.log(C.customer_password);
      var insertid = await Customers.Add(C);
      if (Number.isInteger(insertid)) {
        res.status(200).send({
          customer_id: insertid,
          customer_name: C.customer_name,
          customer_address: C.customer_address,
          customer_phone: C.customer_phone,
          customer_email: C.customer_email,
          customer_password: customer_password,
          customer_pincode: C.customer_pincode,
        });
      } else {
        res.status(500).send({ message: insertid });
      }
    } catch (err) {
      console.log("Error = " + err);
      res.status(500).send({ message: err.message });
    }
  }catch(err)
  {
    res.status(500).send({Message:err});
  }
}
);

router.delete(
  "/delete",
  [
    check("customer_email")
      .trim()
      .bail()
      .isEmail()
      .withMessage("The provided Email is not valid!"),
    check("customer_password")
      .isLength({ min: 8 })
      .withMessage("Password must be at least 8 characters long"),
    check("customer_password")
      .matches(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/
      )
      .withMessage(
        "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character"
      ),
  ],
  async (req, res) => {
    try{
    let { customer_id, customer_email, customer_password } = req.body;
    var affectedRows = await Customers.Delete(
      customer_id,
      customer_email,
      customer_password
    );
    if (affectedRows == 1) {
      res.status(200).send({ Success: "true", message: "Deleted Customer!" });
    } else {
      res
        .staus(500)
        .send({ Success: "false", message: "Could not delete Customer!" });
    }
  }catch(err)
  {
    res.status.send({Message: err});
  }
  }
);

router.get(
  "/find",
  [
    check("customer_email")
      .trim()
      .bail()
      .isEmail()
      .withMessage("The provided Email is not valid!"),
    check("customer_password")
      .isLength({ min: 8 })
      .withMessage("Password must be at least 8 characters long"),
    check("customer_password")
      .matches(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/
      )
      .withMessage(
        "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character"
      ),
  ],
  async (req, res) => {
    try{
    let { customer_id, customer_email, customer_password } = req.body;
    var result = await Customers.Find(
      customer_id,
      customer_email,
      customer_password
    );
    console.log(result);
    res.send(result);
  }
  catch(err)
  {
    res.status(500).send({Message:err});
  }
}
);

router.put(
  "/update_details",
  [
    check("customer_name")
      .trim()
      .bail()
      .isLength({ min: 2, max: 25 })
      .withMessage("Customer Name must be atleast between 2 and 25"),
    check("customer_name")
      .trim()
      .bail()
      .matches(/^\S*\s\S*$/)
      .withMessage("Name must contain exactly one space"),
    check("customer_phone")
      .trim()
      .bail()
      .isLength({ min: 10 })
      .withMessage("Phone number must be greater than or equal to 10 digits"),
  ],
  async (req, res) => {
    try{
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }
    let {
      customer_id,
      customer_name,
      customer_address,
      customer_phone,
      customer_pincode,
    } = req.body;
    let result = await Customers.UpdateDetails(
      customer_id,
      customer_name,
      customer_address,
      customer_phone,
      customer_pincode
    );
    //console.log("Result from routing \n" +result);
    if (result == 1)
      res
        .status(200)
        .send({ Success: "true", message: "Successfully updated details" });
    else {
      res.status(500).send({
        Success: "false",
        message: "Failed to update Customer details!",
      });
    }
  }
  catch(err)
  {
    res.status(500).send({Message:err});
  }
}
);

router.put(
  "/update_email",
  [
    check("customer_id").isInt().withMessage("Customer Id must be a Number!"),
    check("customer_email")
      .trim()
      .bail()
      .isEmail()
      .withMessage("The provided Email is not valid!"),
  ],
  async (req, res) => {
    try{
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }
    let { customer_id, customer_email, customer_new_email } = req.body;
    const result = await Customers.UpdateEmail(
      customer_id,
      customer_email,
      customer_new_email
    );
    if (Number.isInteger(result) && result == 1) {
      res
        .status(200)
        .send({ Success: true, message: "Updated Email Successfully" });
    } else {
      res.status(500).send({
        Success: "false",
        message: "The new email is already in use!",
      });
    }
  }catch(err)
  {
    res.status(500).send({Message : err});
  }
}
);

router.put(
  "/change_password",
  [
    check("customer_id")
      .isNumeric()
      .withMessage("Customer Id must be a Number!"),
    check("customer_password")
      .isLength({ min: 8 })
      .withMessage("Password must be at least 8 characters long"),
    check("customer_password")
      .matches(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/
      )
      .withMessage(
        "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character"
      ),
    check("customer_new_password")
      .isLength(8)
      .withMessage("New Password must be at least 8 characters long"),
    check("customer_new_password")
      .matches(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/
      )
      .withMessage(
        "New Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character"
      ),
  ],
  async (req, res) => {
    try{
    let { customer_id, customer_password, customer_new_password } = req.body;
    const result = await Customers.ChangePassword(
      customer_id,
      customer_password,
      customer_new_password
    );
    console.log(result);
    res.send(result);
  }
  catch(err)
  {
    res.status(500).send({Message:err});
  }
}
);
module.exports = router;
