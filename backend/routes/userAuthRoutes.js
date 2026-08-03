const express = require("express");
const {
  signup,
  login,
  getAllUsers,
  createCustomerByAdmin,
} = require("../controllers/userAuthController");

const adminAuth = require("../middleware/adminAuth");
const vendorAuth = require("../middleware/vendorAuth"); // ✅ ADD

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);

/* ADMIN ONLY */
router.post("/admin/create-customer", adminAuth, createCustomerByAdmin);
router.get("/all", adminAuth, getAllUsers);
router.get("/admin/all", adminAuth, getAllUsers);

/* VENDOR ONLY */
router.get("/vendor/all", vendorAuth, getAllUsers);

module.exports = router;