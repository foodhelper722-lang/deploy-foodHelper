const express = require("express");
const router = express.Router();

const {
  getServiceAreas,
  createServiceAreaCity,
  updateServiceAreaCity,
  deleteServiceAreaCity,
  addAreaToCity,
  updateAreaInCity,
  deleteAreaFromCity,
  toggleAreaStatus,
} = require("../controllers/serviceAreaController");

router.get("/", getServiceAreas);
router.post("/", createServiceAreaCity);
router.put("/:id", updateServiceAreaCity);
router.delete("/:id", deleteServiceAreaCity);

router.post("/:cityId/areas", addAreaToCity);
router.put("/:cityId/areas/:areaId", updateAreaInCity);
router.put("/:cityId/areas/:areaId/status", toggleAreaStatus);
router.delete("/:cityId/areas/:areaId", deleteAreaFromCity);

module.exports = router;
