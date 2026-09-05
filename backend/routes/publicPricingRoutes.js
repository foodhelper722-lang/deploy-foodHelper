const express = require("express");
const router = express.Router();
const Price = require("../models/priceModel");
const VendorProduct = require("../models/vendorProduct");
const VendorBulkDiscount = require("../models/VendorBulkDiscount");
const mongoose = require("mongoose");

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

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    // Admin products keep quantity discounts inside the Price document.
    const adminProduct = await Price.findById(productId).select("name salePrice discounts").lean();
    if (adminProduct) {
      const data = (adminProduct.discounts || []).map((d) => ({
        minQty: d.minQty,
        maxQty: d.maxQty,
        price: adminProduct.salePrice,
        discount: 0,
        discountPercent: d.discountPercent || 0,
      }));

      return res.json({ success: true, count: data.length, data });
    }

    // Vendor products store bulk prices in separate VendorBulkDiscount documents.
    const vendorProduct = await VendorProduct.findById(productId).select("name salePrice").lean();
    if (!vendorProduct) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    const discounts = await VendorBulkDiscount.find({
      product: productId,
      isActive: true,
    }).sort({ minQty: 1 }).lean();

    const data = discounts.map((d) => ({
      minQty: d.minQty,
      maxQty: d.maxQty,
      price: d.unitPrice,
      discount: Math.max(0, Number(vendorProduct.salePrice || 0) - Number(d.unitPrice || 0)),
      discountPercent: Number(vendorProduct.salePrice) > 0
        ? Math.max(0, ((Number(vendorProduct.salePrice) - Number(d.unitPrice)) / Number(vendorProduct.salePrice)) * 100)
        : 0,
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
