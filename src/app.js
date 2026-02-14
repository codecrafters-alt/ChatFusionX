const express = require("express");
const app = express();
const cookieParser = require("cookie-parser");
const authRoutes = require("./routes/auth.routes");
const chatRoutes = require("./routes/chat.routes");
//middlewares
app.use(express.json());
app.use(cookieParser());

//Routes
app.get("/", (req, res) => {
  res.send("ChatFusionX is up and running");
});
app.use("/api/auth", authRoutes);
//end-point: /api/auth/register
app.use("/api/chat", chatRoutes);
//end-point: /api/chat

module.exports = app;
