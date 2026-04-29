const Ticket = require("../models/Ticket");
const User = require("../models/User");
const { sendTicketConfirmationEmail } = require("../utils/emailService");

exports.createTicket = async (req, res) => {
  const { title, description } = req.body;
  try {
    const ticket = await Ticket.create({ title, description, createdBy: req.user.id });
    const user = await User.findById(req.user.id);
    await sendTicketConfirmationEmail(user.email, title);
    res.status(201).json(ticket);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

exports.getUserTickets = async (req, res) => {
  try {
    const tickets = await Ticket.find({ createdBy: req.user.id }).sort({ createdAt: -1 });
    res.json(tickets);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

exports.getAllTickets = async (req, res) => {
  try {
    const tickets = await Ticket.find()
      .populate("createdBy", "name email")
      .sort({ createdAt: -1 });
    res.json(tickets);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

exports.updateTicketStatus = async (req, res) => {
  const { status } = req.body;
  try {
    const ticket = await Ticket.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    if (!ticket) return res.status(404).json({ message: "Ticket not found" });
    res.json(ticket);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};