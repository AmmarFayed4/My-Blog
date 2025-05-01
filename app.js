require("dotenv").config();
const express = require("express");
const cookieParser = require("cookie-parser");
const mongoStore = require("connect-mongo");
const expressLayout = require("express-ejs-layouts");
const methodOverRide = require("method-override");
const connectDB = require("./server/config/db");
const session = require("express-session");
const app = express();
const port = 4000 || process.env.PORT;
// connect to data base
connectDB();
// some middlewares
app.use(methodOverRide("_method"));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());
app.use(
  session({
    secret: "keyboard cat",
    resave: false,
    saveUninitialized: true,
    store: mongoStore.create({
      mongoUrl: process.env.MONGODB_URI,
    }),
    // COOkie: {MaxAge: new Date(Date.new()*(3600000)}
  })
);
// static files
app.use(express.static("public"));
// templating engine
app.use(expressLayout);
app.set("layout", "./layouts/main");
app.set("view engine", "ejs");
// routes
app.use("/", require("./server/routes/main.js"));
app.use("/", require("./server/routes/admin.js"));

app.listen(port, () => {
  console.log(`localhost:${port}`);
});
