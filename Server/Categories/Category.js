class Category {
  constructor(category_name, category_description) {
    this.category_name = category_name;
    this.category_description = category_description;
  }

  ChangeCategoryDescription(new_description) {
    this.category_description = new_description;
  }

  ChangeCategoryName(new_category_name) {
    this.category_name = new_category_name;
  }
}
module.exports = { Category };
