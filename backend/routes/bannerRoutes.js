const express = require("express");
const router = express.Router();
const upload = require("../middleware/upload");
const {
  getBanners,
  createBanner,
  updateBanner,
  deleteBanner,
  toggleBannerStatus,
} = require("../controllers/bannerController");

router.get("/", getBanners);
router.post("/", upload.single("image"), createBanner);
router.put("/:id", upload.single("image"), updateBanner);
router.delete("/:id", deleteBanner);
router.put("/toggle/:id", toggleBannerStatus);

module.exports = router;
