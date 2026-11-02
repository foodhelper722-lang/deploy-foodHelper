const express = require("express");
const router = express.Router();
const unitDefController = require("../controllers/unitDefController");

// ── GET ALL UNIT DEFINITIONS ──────────────────────────────
router.get("/", unitDefController.getUnitDefs);

// ── GET SINGLE UNIT DEFINITION (BY ID OR KEY) ────────────
router.get("/:id", unitDefController.getUnitDefById);

// ── CREATE NEW UNIT DEFINITION ───────────────────────────
router.post("/", unitDefController.createUnitDef);

// ── UPDATE UNIT DEFINITION ───────────────────────────────
router.put("/:id", unitDefController.updateUnitDef);

// ── DELETE UNIT DEFINITION ───────────────────────────────
router.delete("/:id", unitDefController.deleteUnitDef);

module.exports = router;
