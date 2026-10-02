const express = require("express");
const router = express.Router();
const Coffee = require("../models/Coffee");

// ========================================
// GET /api/coffees
// Get all coffees
// ========================================
router.get("/", async (req, res) => {
  try {
    const coffees = await Coffee.find().sort({ id: 1 });

    res.status(200).json(coffees);
  } catch (error) {
    console.error("Error fetching coffees:", error);

    res.status(500).json({
      message: "Failed to fetch coffees",
    });
  }
});

// ========================================
// POST /api/coffees/:id/vote
// Increment vote count by 1
// ========================================
router.post("/:id/vote", async (req, res) => {
  try {
    const coffeeId = Number(req.params.id);

    if (!Number.isInteger(coffeeId)) {
      return res.status(400).json({
        message: "Invalid coffee ID",
      });
    }

    const coffee = await Coffee.findOneAndUpdate(
      { id: coffeeId },
      { $inc: { votes: 1 } },
      { new: true }
    );

    if (!coffee) {
      return res.status(404).json({
        message: "Coffee not found",
      });
    }

    res.status(200).json(coffee);
  } catch (error) {
    console.error("Error voting:", error);

    res.status(500).json({
      message: "Failed to register vote",
    });
  }
});

module.exports = router;