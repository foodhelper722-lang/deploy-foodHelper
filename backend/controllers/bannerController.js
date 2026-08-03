const fs = require("fs");
const path = require("path");
const Banner = require("../models/Banner");

const buildImageUrl = (req, filename) => {
  const host = req.get("host") || "localhost:7000";
  const protocol = req.protocol || "http";
  return `${protocol}://${host}/uploads/${filename}`;
};

exports.getBanners = async (req, res) => {
  try {
    const banners = await Banner.find().sort({ createdAt: -1 });
    res.json({ success: true, data: banners });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.createBanner = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: "Banner image is required" });
    }

    const banner = await Banner.create({
      image: buildImageUrl(req, req.file.filename),
      status: "active",
    });

    res.status(201).json({ success: true, data: banner });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.updateBanner = async (req, res) => {
  try {
    const banner = await Banner.findById(req.params.id);
    if (!banner) {
      return res.status(404).json({ success: false, message: "Banner not found" });
    }

    if (req.file) {
      const oldFile = banner.image.split("/uploads/")[1];
      if (oldFile) {
        const oldPath = path.join(__dirname, "..", "uploads", oldFile);
        if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
      }

      banner.image = buildImageUrl(req, req.file.filename);
    }

    await banner.save();
    res.json({ success: true, data: banner });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.deleteBanner = async (req, res) => {
  try {
    const banner = await Banner.findById(req.params.id);
    if (!banner) {
      return res.status(404).json({ success: false, message: "Banner not found" });
    }

    const fileName = banner.image.split("/uploads/")[1];
    if (fileName) {
      const filePath = path.join(__dirname, "..", "uploads", fileName);
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    }

    await Banner.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "Banner deleted" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.toggleBannerStatus = async (req, res) => {
  try {
    const banner = await Banner.findById(req.params.id);
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
