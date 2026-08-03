
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

/* ================= SIGNUP ================= */
exports.signup = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // ✅ VALIDATION
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    const exists = await User.findOne({ email });
    if (exists) {
      return res.status(400).json({
        success: false,
        message: "User already exists",
      });
    }

    // ✅ HASH PASSWORD
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name: name || "",
      email,
      password: hashedPassword,
    });

    res.status(201).json({
      success: true,
      message: "Signup successful",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    console.error("Signup error:", err.message);
    res.status(500).json({ success: false, message: err.message });
  }
};

/* ================= LOGIN ================= */
/* ================= LOGIN ================= */
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password required",
      });
    }

    // 🔥 IMPORTANT FIX
    const user = await User.findOne({ email }).select("+password");

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    user.lastLoginAt = new Date();
    await user.save();

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    console.error("Login error:", err.message);
    res.status(500).json({ success: false, message: err.message });
  }
};


/* ================= ADMIN: CREATE CUSTOMER ================= */
exports.createCustomerByAdmin = async (req, res) => {
  try {
    const { name, phone = "", address = "" } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: "Customer name is required",
      });
    }

    const safeName = name.trim();
    const safePhone = phone?.trim() || "";
    const safeAddress = address?.trim() || "";

    const existingUser = safePhone
      ? await User.findOne({ phone: safePhone })
      : null;

    if (existingUser) {
      return res.status(200).json({
        success: true,
        message: "Customer already exists",
        data: existingUser,
      });
    }

    const baseEmail = safeName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "guest";

    const uniqueEmail = `${baseEmail}-${Date.now()}-${Math.floor(Math.random() * 1000)}@guest.local`;
    const tempPassword = `${safePhone || baseEmail}123!`;
    const hashedPassword = await bcrypt.hash(tempPassword, 10);

    const user = await User.create({
      name: safeName,
      email: uniqueEmail,
      phone: safePhone,
      address: safeAddress,
      password: hashedPassword,
      role: "user",
    });

    res.status(201).json({
      success: true,
      message: "Customer added successfully",
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        address: user.address,
        role: user.role,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    });
  } catch (err) {
    console.error("Create customer error:", err.message);
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

/* ================= ADMIN: GET ALL USERS ================= */
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find()
      .select("-password")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: users,
    });
  } catch (err) {
    console.error("Get users error:", err.message);
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};



