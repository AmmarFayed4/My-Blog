const mongoose = require("mongoose");

const conncetDB = async () => {
  try {
    mongoose.set("strictQuery", false);
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`Database connected ${conn.connection.host} `);
  } catch (err) {
    console.log(err);
  }
};

module.exports = conncetDB;
