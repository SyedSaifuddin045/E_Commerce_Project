const express = require("express");

const router = express.Router();

const { check, validationResult } = require("express-validator");

const bcrypt = require("bcrypt");

const Seller = require("./Sellers.js");

router.post(
  "/new",
  [
    check("seller_name")
      .trim()
      .bail()
      .isLength({ min: 2, max: 25 })
      .withMessage("Name must be atleast between 2 and 25"),
    check("seller_name")
      .trim()
      .bail()
      .matches(/\S+\s\S+/)
      .withMessage("Name must contain exactly one space"),
    check("seller_phone")
      .trim()
      .bail()
      .isLength({ min: 10 })
      .withMessage("Phone number must be greater than or equal to 10 digits"),
    check("seller_email")
      .trim()
      .bail()
      .isEmail()
      .withMessage("The provided Email is not valid!"),
    check("seller_password")
      .isLength({ min: 8 })
      .withMessage("Password must be at least 8 characters long"),
    check("seller_password")
      .matches(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/
      )
      .withMessage(
        "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character"
      ),
  ],
  async (req, res) => {
    try 
    {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(422).json({ errors: errors.array() });
      }
      let { seller_name, seller_phone, seller_email, seller_password } =
        req.body;
      let hashed_password =await bcrypt.hash(seller_password,10);
      console.log(hashed_password);
      var insertId = await Seller.Add(
        seller_name,
        seller_phone,
        seller_email,
        hashed_password
      );
      if (Number.isInteger(insertId)) {
        res.status(200).send({
          seller_id: insertId,
          seller_name: seller_name,
          seller_phone :seller_phone,
          seller_email:seller_email,
          seller_password :seller_password
        });
      }
    } 
    catch (err) {
      console.log("Error Occured = " + err);
      res.status(500).send({ message: err.message });
    }
  }
);

router.get('/find',async (req,res)=>{
    try{
    let {seller_id, seller_email, seller_password} = req.body;
    const result = await Seller.Find(seller_id, seller_email, seller_password);
    console.log(result);
    res.send(result);
    }
    catch(err)
    {
        res.status(500).send({message:err});
    }
})

module.exports = router;
