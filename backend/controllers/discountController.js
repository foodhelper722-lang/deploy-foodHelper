// const DiscountRule = require("../models/DiscountRule");

// exports.addDiscount = async (req, res) => {
//   const rule = await DiscountRule.create(req.body);
//   res.json({ success: true, rule });
// };


const DiscountRule = require("../models/DiscountRule");
const VendorProduct = require("../models/vendorProduct");
const VendorBulkDiscount = require("../models/VendorBulkDiscount");

/* ======================================================
   CREATE DISCOUNT RULE
====================================================== */
exports.addDiscount = async (req, res) => {
  try {
    /* ✅ FIX: BODY SE DATA NIKALNA ZAROORI */
    const { product, minQty, maxQty = null, unitPrice } = req.body;

    /* ===== BASIC VALIDATION ===== */
    if (!product || minQty === undefined || unitPrice === undefined) {
      return res.status(400).json({
        success: false,
        message: "Product, Min Qty and Unit Price are required",
      });
    }

    if (!Number.isInteger(minQty) || minQty < 1) {
      return res.status(400).json({
        success: false,
        message: "Min Qty must be an integer ≥ 1",
      });
    }

    if (maxQty !== null) {
      if (!Number.isInteger(maxQty) || maxQty < minQty) {
        return res.status(400).json({
          success: false,
          message: "Max Qty must be ≥ Min Qty",
        });
      }
    }

    if (unitPrice <= 0) {
      return res.status(400).json({
        success: false,
        message: "Unit Price must be greater than 0",
      });
    }

    /* ===== DUPLICATE CHECK ===== */
    const exists = await DiscountRule.findOne({ product, minQty, maxQty });
    if (exists) {
      return res.status(400).json({
        success: false,
        message: "Discount rule already exists for this range",
      });
    }

    /* ===== CREATE ===== */
    const rule = await DiscountRule.create({
      product,
      minQty,
      maxQty,
      unitPrice,
    });

    return res.status(201).json({
      success: true,
      message: "Discount rule added successfully",
      data: rule,
    });

  } catch (err) {
    console.error("Add Discount Error:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to add discount rule",
    });
  }
};

/* ======================================================
   GET ALL DISCOUNT RULES
====================================================== */
exports.getAllDiscounts = async (req, res) => {
  try {
    const rules = await DiscountRule.find()
      .populate("product", "name")
      .sort({ minQty: 1 });

    return res.json({
      success: true,
      count: rules.length,
      data: rules,
    });
  } catch (err) {
    console.error("Get Discount Error:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch discounts",
    });
  }
};

/* ======================================================
   GET DISCOUNT RULES FOR ONE PRODUCT
====================================================== */
exports.getDiscountsByProduct = async (req, res) => {
  try {
    const { productId } = req.params;
    const vendorProduct = await VendorProduct.findById(productId).select("_id").lean();

    if (vendorProduct) {
      const discounts = await VendorBulkDiscount.find({
        product: productId,
        isActive: true,
      })
        .sort({ minQty: 1 })
        .lean();

      const data = discounts.map((discount) => ({
        _id: discount._id,
        product: discount.product,
        minQty: discount.minQty,
        maxQty: discount.maxQty,
        unitPrice: discount.unitPrice,
      }));

      return res.json({
        success: true,
        count: data.length,
        data,
      });
    }

    const rules = await DiscountRule.find({ product: productId })
      .sort({ minQty: 1 });

    return res.json({
      success: true,
      count: rules.length,
      data: rules,
    });
  } catch (err) {
    console.error("Get Product Discounts Error:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch product discounts",
    });
  }
};

/* ======================================================
   UPDATE DISCOUNT RULE
====================================================== */
exports.updateDiscount = async (req, res) => {
  try {
    const { minQty, maxQty, unitPrice } = req.body;

    const rule = await DiscountRule.findById(req.params.id);
    if (!rule) {
      return res.status(404).json({
        success: false,
        message: "Discount rule not found",
      });
    }

    if (minQty !== undefined && minQty < 1) {
      return res.status(400).json({
        success: false,
        message: "Min Qty must be ≥ 1",
      });
    }

    if (maxQty !== null && maxQty !== undefined && maxQty < minQty) {
      return res.status(400).json({
        success: false,
        message: "Max Qty must be ≥ Min Qty",
      });
    }

    if (unitPrice !== undefined && unitPrice <= 0) {
      return res.status(400).json({
        success: false,
        message: "Unit Price must be greater than 0",
      });
    }

    rule.minQty = minQty ?? rule.minQty;
    rule.maxQty = maxQty ?? rule.maxQty;
    rule.unitPrice = unitPrice ?? rule.unitPrice;

    await rule.save();

    return res.json({
      success: true,
      message: "Discount rule updated",
      data: rule,
    });

  } catch (err) {
    console.error("Update Discount Error:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to update discount rule",
    });
  }
};

/* ======================================================
   DELETE DISCOUNT RULE
====================================================== */
exports.deleteDiscount = async (req, res) => {
  try {
    const rule = await DiscountRule.findByIdAndDelete(req.params.id);

    if (!rule) {
      return res.status(404).json({
        success: false,
        message: "Discount rule not found",
      });
    }

    return res.json({
      success: true,
      message: "Discount rule deleted successfully",
    });
  } catch (err) {
    console.error("Delete Discount Error:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to delete discount rule",
    });
  }
};
