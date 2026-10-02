const mongoose = require("mongoose");

const coffeeSchema = new mongoose.Schema(
  {
    id: {
      type: Number,
      required: true,
      unique: true,
    },
    name: {
      type: String,
      required: true,
    },
    origin: {
      type: String,
      required: true,
    },
    roast: {
      type: String,
      required: true,
    },
    rating: {
      type: Number,
      required: true,
    },
    votes: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Coffee", coffeeSchema);