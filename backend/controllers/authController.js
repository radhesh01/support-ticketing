const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const User = require("../models/User");
const generateToken = require("../utils/generateToken");
const { sendOTPEmail } = require("../utils/emailService");

exports.register = async (req, res) => {
  const { name, email, password } = req.body;
  try {
    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ message: "Email already registered" });

    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, password: hashed });
    res.status(201).json({ message: "Registered successfully", userId: user._id });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(400).json({ message: "Invalid credentials" });

    const otp = crypto.randomInt(100000, 999999).toString();
    const hashedOtp = await bcrypt.hash(otp, 10);

    user.otp = hashedOtp;
    user.otpExpiry = new Date(Date.now() + 5 * 60 * 1000);
    await user.save();

    await sendOTPEmail(email, otp);
    res.json({ message: "OTP sent to email", email });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

exports.verifyOtp = async (req, res) => {
  const { email, otp } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user || !user.otp) return res.status(400).json({ message: "Invalid request" });

    if (user.otpExpiry < new Date()) {
      user.otp = undefined;
      user.otpExpiry = undefined;
      await user.save();
      return res.status(400).json({ message: "OTP expired" });
    }

    const valid = await bcrypt.compare(otp, user.otp);
    if (!valid) return res.status(400).json({ message: "Invalid OTP" });

    user.otp = undefined;
    user.otpExpiry = undefined;
    await user.save();

    const token = generateToken(user._id, user.role);
    res.json({ token, role: user.role, name: user.name });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};