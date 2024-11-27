const express = require("express");
const bodyParser = require('body-parser');
const cors = require('cors');
const dbConfig = require('./db')
const dotenv = require("dotenv");
const passport = require("passport");
const orderRoutes = require('./routes/orderRoute');
const authRoutes = require("./routes/auth"); 

dotenv.config();
require("./config/passport");

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.json()); // Ensure JSON parsing is supported
app.use(passport.initialize()); // Initialize passport

// Routes

app.use('/api/orders', orderRoutes);  // This ensures /api/orders/:id will work for DELETE
app.use("/auth", authRoutes);

const port = process.env.PORT || 5000;

app.listen(port, () => console.log('Node server started'));