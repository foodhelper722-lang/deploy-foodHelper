const mongoose = require("mongoose");

const advertisingBannerSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      default: "",
    },
    image: {
      type: String,
      required: true,
    },
    bannerPosition: {
      type: String,
      enum: ["front", "back"],
      default: "front",
    },
    categoryId: {
      type: String,
      default: "",
    },
    subcategoryId: {
      type: String,
      default: "",
    },
    productSource: {
      type: String,
      default: "",
    },
    productId: {
      type: String,
      default: "",
    },
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },
    startDate: {
      type: Date,
      default: null,
    },
    endDate: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("AdvertisingBanner", advertisingBannerSchema);
