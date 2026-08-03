const fs = require("fs");
const path = require("path");
const AdvertisingBanner = require("../models/AdvertisingBanner");

const buildImageUrl = (req, filename) => {
  const host = req.get("host") || "localhost:7000";
  const protocol = req.protocol || "http";
  return `${protocol}://${host}/uploads/${filename}`;
};

exports.getAdvertisingBanners = async (req, res) => {
  try {
    const banners = await AdvertisingBanner.find().sort({ createdAt: -1 });
    res.json({ success: true, data: banners });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.createAdvertisingBanner = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: "Banner image is required" });
    }

    const payload = {
      title: req.body.title || "",
      image: buildImageUrl(req, req.file.filename),
      bannerPosition: req.body.bannerPosition || "front",
      categoryId: req.body.categoryId || "",
      subcategoryId: req.body.subcategoryId || "",
      productSource: req.body.productSource || "",
      productId: req.body.productId || "",
      status: req.body.status || "active",
      startDate: req.body.startDate ? new Date(req.body.startDate) : null,
      endDate: req.body.endDate ? new Date(req.body.endDate) : null,
    };

    const banner = await AdvertisingBanner.create(payload);
    res.status(201).json({ success: true, data: banner });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.updateAdvertisingBanner = async (req, res) => {
  try {
    const banner = await AdvertisingBanner.findById(req.params.id);
    if (!banner) {
      return res.status(404).json({ success: false, message: "Banner not found" });
    }

    if (req.file) {
      const oldFile = banner.image?.split("/uploads/")[1];
      if (oldFile) {
        const oldPath = path.join(__dirname, "..", "uploads", oldFile);
        if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
      }
      banner.image = buildImageUrl(req, req.file.filename);
    }

    banner.title = req.body.title || banner.title;
    banner.bannerPosition = req.body.bannerPosition || banner.bannerPosition;
    banner.categoryId = req.body.categoryId || "";
    banner.subcategoryId = req.body.subcategoryId || "";
    banner.productSource = req.body.productSource || "";
    banner.productId = req.body.productId || "";
    banner.status = req.body.status || banner.status;
    banner.startDate = req.body.startDate ? new Date(req.body.startDate) : banner.startDate;
    banner.endDate = req.body.endDate ? new Date(req.body.endDate) : banner.endDate;

    await banner.save();
    res.json({ success: true, data: banner });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.deleteAdvertisingBanner = async (req, res) => {
  try {
    const banner = await AdvertisingBanner.findById(req.params.id);
    if (!banner) {
      return res.status(404).json({ success: false, message: "Banner not found" });
    }

    const fileName = banner.image?.split("/uploads/")[1];
    if (fileName) {
      const filePath = path.join(__dirname, "..", "uploads", fileName);
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    }

    await AdvertisingBanner.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "Banner deleted" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.toggleAdvertisingBannerStatus = async (req, res) => {
  try {
    const banner = await AdvertisingBanner.findById(req.params.id);
    if (!banner) {
      return res.status(404).json({ success: false, message: "Banner not found" });
    }

    banner.status = banner.status === "active" ? "inactive" : "active";
    await banner.save();

    res.json({ success: true, data: banner });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
