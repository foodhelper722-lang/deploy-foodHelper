const express = require("express");
const router = express.Router();
const Price = require("../models/priceModel");

/**
 * Get pricing discount ranges for a specific product
 * Mobile app calls this to show bulk pricing in the app
 */
router.get("/:productId", async (req, res) => {
  try {
    const { productId } = req.params;

    if (!productId) {
      return res.status(400).json({
        success: false,
        message: "Product ID is required",
      });
    }

    // Fetch product with its discounts
    const product = await Price.findById(productId).select("name salePrice discounts");

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    // Format discounts for mobile app
    const data = product.discounts.map((d) => ({
      minQty: d.minQty,
      maxQty: d.maxQty,
      price: product.salePrice,
      discount: 0,
      discountPercent: d.discountPercent || 0,
    }));

    return res.json({
      success: true,
      count: data.length,
      data: data,
    });
  } catch (err) {
    console.error("Get Public Pricing Error:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to load discounts",
    });
  }
});

module.exports = router;
