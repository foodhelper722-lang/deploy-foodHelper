const router = require("express").Router();
const {
  addDiscount,
  getAllDiscounts,
  getDiscountsByProduct,
  updateDiscount,
  deleteDiscount,
} = require("../controllers/discountController");

/* CREATE */
router.post("/add", addDiscount);

/* READ */
router.get("/all", getAllDiscounts);
router.get("/product/:productId", getDiscountsByProduct);

/* UPDATE */
router.put("/:id", updateDiscount);

/* DELETE */
router.delete("/:id", deleteDiscount);

module.exports = router;
