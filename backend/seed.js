const dns = require("node:dns");

dns.setServers(["1.1.1.1", "8.8.8.8"]);

const mongoose = require("mongoose");
require("dotenv").config();

const Coffee = require("./models/Coffee");
const coffees = require("./data/coffees.json");

async function seedDatabase() {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    console.log("MongoDB connected");

    await Coffee.deleteMany({});
    console.log("Old coffee data cleared");

    await Coffee.insertMany(coffees);
    console.log(`${coffees.length} coffees inserted successfully!`);

    await mongoose.connection.close();
    console.log("Database connection closed");

  } catch (error) {
    console.error("Seeding failed:", error);

    await mongoose.connection.close();
    process.exit(1);
  }
}

seedDatabase();