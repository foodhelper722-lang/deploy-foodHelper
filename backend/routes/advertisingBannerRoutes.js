const express = require("express");
const router = express.Router();
const upload = require("../middleware/upload");
const {
  getAdvertisingBanners,
  createAdvertisingBanner,
  updateAdvertisingBanner,
  deleteAdvertisingBanner,
  toggleAdvertisingBannerStatus,
} = require("../controllers/advertisingBannerController");

router.get("/", getAdvertisingBanners);
router.post("/", upload.single("image"), createAdvertisingBanner);
router.put("/:id", upload.single("image"), updateAdvertisingBanner);
router.delete("/:id", deleteAdvertisingBanner);
router.put("/toggle/:id", toggleAdvertisingBannerStatus);

module.exports = router;
