const express = require("express");
const router = express.Router();
const { check, validationResult } = require("express-validator");

const { Category } = require("./Category.js");
const { Categories } = require("./Categories.js");

router.post(
  "/new",
  [
    check("category_name")
      .isLength({ min: 2, max: 30 })
      .withMessage("Category name must be between 2 and 30 characters"),
    check("category_description")
      .isLength({ min: 2 })
      .withMessage("Category description must be at least 2 characters"),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }
    let { category_name, category_description } = req.body;
    let C = new Category(category_name, category_description);

    await Categories.Add(C)
      .then((result) => {
        res.status(200).send({
          category_id: result,
          category_name: category_name,
          category_description: category_description,
        });
      })
      .catch((err) => {
        res
          .status(500)
          .send({ message: `Error failed to insert category : \n ${err}` });
      });
  }
);

router.delete("/delete/:name", async (req, res) => {
  try {
    const affectedRows = await Categories.Delete(req.params.name);
    if (affectedRows == 0) {
      return res.status(404).send({ message: "Category not found!" });
    }
    res.send({ message: "Category Deleted Successfully" });
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
});

router.put(
  "/update/:name",
  [
    check("category_name")
      .isLength({ min: 2, max: 30 })
      .withMessage("Category name must be between 2 and 30 characters"),
    check("category_description")
      .isLength({ min: 2 })
      .withMessage("Category description must be at least 2 characters"),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }
    let { category_name, category_description } = req.body;
    let C = new Category(category_name, category_description);
    try {
      const affectedRows = await Categories.Update(C);
      if (affectedRows == 0) {
        return res.status(404).send({ message: "Category not found!" });
      }
      res.send({ message: "Product Updated Successfully" });
    } catch (err) {
      res.status(500).send({ message: err.message });
    }
  }
);

router.get("/find/:name", async (req, res) => {
  try {
    const found = await Categories.find(new Category(req.params.name));
    return res.status(200).send(found);
  } catch (err) {
    if (err.message === "Category not found")
      return res.status(404).send({ message: err.message });
    else return res.status(404).send({ message: err.message });
  }
});

module.exports = router;
