const ServiceArea = require("../models/ServiceArea");

exports.getServiceAreas = async (req, res) => {
  try {
    const serviceAreas = await ServiceArea.find().sort({ createdAt: -1 });
    res.json({ success: true, data: serviceAreas });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.createServiceAreaCity = async (req, res) => {
  try {
    const { city, state } = req.body;

    if (!city?.trim() || !state?.trim()) {
      return res.status(400).json({ success: false, message: "City and state are required" });
    }

    const exists = await ServiceArea.findOne({ city: { $regex: new RegExp(`^${city.trim()}$`, "i") } });
    if (exists) {
      return res.status(409).json({ success: false, message: "This city already exists" });
    }

    const serviceArea = await ServiceArea.create({ city: city.trim(), state: state.trim() });
    res.status(201).json({ success: true, data: serviceArea, message: "City created successfully" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.updateServiceAreaCity = async (req, res) => {
  try {
    const { city, state } = req.body;

    if (!city?.trim() || !state?.trim()) {
      return res.status(400).json({ success: false, message: "City and state are required" });
    }

    const existing = await ServiceArea.findOne({
      city: { $regex: new RegExp(`^${city.trim()}$`, "i") },
      _id: { $ne: req.params.id },
    });

    if (existing) {
      return res.status(409).json({ success: false, message: "This city already exists" });
    }

    const updated = await ServiceArea.findByIdAndUpdate(
      req.params.id,
      { city: city.trim(), state: state.trim() },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ success: false, message: "City not found" });
    }

    res.json({ success: true, data: updated, message: "City updated successfully" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.deleteServiceAreaCity = async (req, res) => {
  try {
    const deleted = await ServiceArea.findByIdAndDelete(req.params.id);

    if (!deleted) {
      return res.status(404).json({ success: false, message: "City not found" });
    }

    res.json({ success: true, message: "City deleted successfully" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.addAreaToCity = async (req, res) => {
  try {
    const { cityId } = req.params;
    const { name, pincode, deliveryCharge = 0, handlingCharge = 0 } = req.body;

    if (!name?.trim() || !pincode?.trim()) {
      return res.status(400).json({ success: false, message: "Area name and pincode are required" });
    }

    const serviceArea = await ServiceArea.findById(cityId);
    if (!serviceArea) {
      return res.status(404).json({ success: false, message: "City not found" });
    }

    const exists = serviceArea.areas.some(
      (area) => area.pincode.toString() === pincode.trim().toString() && area.name.toLowerCase() === name.trim().toLowerCase()
    );

    if (exists) {
      return res.status(409).json({ success: false, message: "This area already exists in the city" });
    }

    serviceArea.areas.push({
      name: name.trim(),
      pincode: pincode.trim(),
      deliveryCharge: Number(deliveryCharge) || 0,
      handlingCharge: Number(handlingCharge) || 0,
      active: true,
    });

    await serviceArea.save();
    res.status(201).json({ success: true, data: serviceArea, message: "Area added successfully" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.updateAreaInCity = async (req, res) => {
  try {
    const { cityId, areaId } = req.params;
    const { name, pincode, deliveryCharge, handlingCharge } = req.body;

    if (!name?.trim() || !pincode?.trim()) {
      return res.status(400).json({ success: false, message: "Area name and pincode are required" });
    }

    const serviceArea = await ServiceArea.findById(cityId);
    if (!serviceArea) {
      return res.status(404).json({ success: false, message: "City not found" });
    }

    const area = serviceArea.areas.id(areaId);
    if (!area) {
      return res.status(404).json({ success: false, message: "Area not found" });
    }

    area.name = name.trim();
    area.pincode = pincode.trim();
    area.deliveryCharge = Number(deliveryCharge) || 0;
    area.handlingCharge = Number(handlingCharge) || 0;

    await serviceArea.save();
    res.json({ success: true, data: serviceArea, message: "Area updated successfully" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.deleteAreaFromCity = async (req, res) => {
  try {
    const { cityId, areaId } = req.params;

    const serviceArea = await ServiceArea.findById(cityId);
    if (!serviceArea) {
      return res.status(404).json({ success: false, message: "City not found" });
    }

    serviceArea.areas = serviceArea.areas.filter((area) => area._id.toString() !== areaId);
    await serviceArea.save();

    res.json({ success: true, message: "Area deleted successfully" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.toggleAreaStatus = async (req, res) => {
  try {
    const { cityId, areaId } = req.params;
    const { active } = req.body;

    const serviceArea = await ServiceArea.findById(cityId);
    if (!serviceArea) {
      return res.status(404).json({ success: false, message: "City not found" });
    }

    const area = serviceArea.areas.id(areaId);
    if (!area) {
      return res.status(404).json({ success: false, message: "Area not found" });
    }

    area.active = Boolean(active);
    await serviceArea.save();

    res.json({ success: true, data: serviceArea, message: "Area status updated successfully" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
