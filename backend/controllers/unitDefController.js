const mongoose = require("mongoose");
const UnitDef = require("../models/unitDefModel");

/* ======================================================
      DEFAULT BASE UNIT
====================================================== */
const DEFAULT_BASE_UNIT = {
  key: "pcs",
  label: "Pcs",
  multiplier: 1,
  isDefault: true,
  order: 0,
};

/* ======================================================
      AUTO-SEED DEFAULT UNIT IF EMPTY
====================================================== */
async function ensureDefaultBaseUnit() {
  try {
    const existing = await UnitDef.findOne({ key: "pcs" });
    if (!existing) {
      await UnitDef.create(DEFAULT_BASE_UNIT);
    }
  } catch (err) {
    console.error("ensureDefaultBaseUnit warning:", err.message);
  }
}

/* ======================================================
      GET ALL UNIT DEFINITIONS
====================================================== */
exports.getUnitDefs = async (req, res) => {
  try {
    await ensureDefaultBaseUnit();

    const query = {};
    if (req.query.search) {
      const q = new RegExp(req.query.search.trim(), "i");
      query.$or = [{ key: q }, { label: q }];
    }

    const defs = await UnitDef.find(query).sort({ order: 1, multiplier: 1, createdAt: 1 }).lean();

    res.json({
      success: true,
      count: defs.length,
      data: defs,
    });
  } catch (err) {
    console.error("❌ getUnitDefs error:", err.message);
    res.status(500).json({ success: false, message: err.message });
  }
};

/* ======================================================
      GET SINGLE UNIT DEFINITION
====================================================== */
exports.getUnitDefById = async (req, res) => {
  try {
    const { id } = req.params;
    let def = null;

    if (mongoose.Types.ObjectId.isValid(id)) {
      def = await UnitDef.findById(id).lean();
    }
    if (!def) {
      def = await UnitDef.findOne({ key: id.toLowerCase().trim() }).lean();
    }

    if (!def) {
      return res.status(404).json({ success: false, message: "Unit definition not found" });
    }

    res.json({ success: true, data: def });
  } catch (err) {
    console.error("❌ getUnitDefById error:", err.message);
    res.status(500).json({ success: false, message: err.message });
  }
};

/* ======================================================
      CREATE UNIT DEFINITION
====================================================== */
exports.createUnitDef = async (req, res) => {
  try {
    const { label, multiplier, order, isDefault } = req.body;

    if (!label || !String(label).trim()) {
      return res.status(400).json({ success: false, message: "Label is required" });
    }

    const nMultiplier = Number(multiplier);
    if (!Number.isFinite(nMultiplier) || nMultiplier < 1) {
      return res.status(400).json({ success: false, message: "Multiplier must be a number greater than or equal to 1" });
    }

    // Key generation and normalization
    let rawKey = req.body.key ? String(req.body.key).trim() : String(label).trim();
    let key = rawKey.toLowerCase().replace(/[^a-z0-9_-]/g, "_");
    if (!key) key = `unit_${Date.now()}`;

    // Duplicate check
    const existing = await UnitDef.findOne({ key });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: `Unit definition with key '${key}' already exists`,
      });
    }

    const created = await UnitDef.create({
      key,
      label: String(label).trim(),
      multiplier: nMultiplier,
      isDefault: Boolean(isDefault || key === "pcs"),
      order: Number.isFinite(Number(order)) ? Number(order) : 0,
    });

    res.status(201).json({
      success: true,
      message: "Unit definition created successfully",
      data: created,
    });
  } catch (err) {
    console.error("❌ createUnitDef error:", err.message);
    res.status(500).json({ success: false, message: err.message });
  }
};

/* ======================================================
      UPDATE UNIT DEFINITION
====================================================== */
exports.updateUnitDef = async (req, res) => {
  try {
    const { id } = req.params;
    let def = null;

    if (mongoose.Types.ObjectId.isValid(id)) {
      def = await UnitDef.findById(id);
    }
    if (!def) {
      def = await UnitDef.findOne({ key: id.toLowerCase().trim() });
    }

    if (!def) {
      return res.status(404).json({ success: false, message: "Unit definition not found" });
    }

    const { label, multiplier, order, isDefault, key } = req.body;

    // Protection for base unit "pcs"
    if (def.key === "pcs" || def.isDefault) {
      if (multiplier !== undefined && Number(multiplier) !== 1) {
        return res.status(400).json({
          success: false,
          message: "Base unit multiplier cannot be changed from 1",
        });
      }
      if (key !== undefined && String(key).toLowerCase().trim() !== "pcs") {
        return res.status(400).json({
          success: false,
          message: "Base unit key cannot be changed",
        });
      }
    }

    if (label !== undefined) {
      if (!String(label).trim()) {
        return res.status(400).json({ success: false, message: "Label cannot be empty" });
      }
      def.label = String(label).trim();
    }

    if (multiplier !== undefined) {
      const nMultiplier = Number(multiplier);
      if (!Number.isFinite(nMultiplier) || nMultiplier < 1) {
        return res.status(400).json({
          success: false,
          message: "Multiplier must be a number greater than or equal to 1",
        });
      }
      def.multiplier = nMultiplier;
    }

    if (order !== undefined) {
      const nOrder = Number(order);
      if (Number.isFinite(nOrder)) def.order = nOrder;
    }

    if (isDefault !== undefined && def.key !== "pcs") {
      def.isDefault = Boolean(isDefault);
    }

    if (key !== undefined && def.key !== "pcs") {
      const newKey = String(key).toLowerCase().trim().replace(/[^a-z0-9_-]/g, "_");
      if (newKey && newKey !== def.key) {
        const keyExists = await UnitDef.findOne({ key: newKey, _id: { $ne: def._id } });
        if (keyExists) {
          return res.status(400).json({
            success: false,
            message: `Unit definition with key '${newKey}' already exists`,
          });
        }
        def.key = newKey;
      }
    }

    await def.save();

    res.json({
      success: true,
      message: "Unit definition updated successfully",
      data: def,
    });
  } catch (err) {
    console.error("❌ updateUnitDef error:", err.message);
    res.status(500).json({ success: false, message: err.message });
  }
};

/* ======================================================
      DELETE UNIT DEFINITION
====================================================== */
exports.deleteUnitDef = async (req, res) => {
  try {
    const { id } = req.params;
    let def = null;

    if (mongoose.Types.ObjectId.isValid(id)) {
      def = await UnitDef.findById(id);
    }
    if (!def) {
      def = await UnitDef.findOne({ key: id.toLowerCase().trim() });
    }

    if (!def) {
      return res.status(404).json({ success: false, message: "Unit definition not found" });
    }

    // Protection for base unit "pcs"
    if (def.key === "pcs" || def.isDefault) {
      return res.status(400).json({
        success: false,
        message: "Base unit ('Pcs') is default and cannot be deleted",
      });
    }

    await UnitDef.findByIdAndDelete(def._id);

    res.json({
      success: true,
      message: `Unit definition '${def.label}' (${def.key}) deleted successfully`,
    });
  } catch (err) {
    console.error("❌ deleteUnitDef error:", err.message);
    res.status(500).json({ success: false, message: err.message });
  }
};
