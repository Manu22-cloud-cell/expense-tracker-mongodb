require("dotenv").config();

const path = require("path");
const fs = require("fs");
const express = require("express");
const morgan = require("morgan");
const cors = require("cors");

const connectDB = require("./utils/db-connection");
const userRouter = require("./routes/userRoutes");
const expenseRouter = require("./routes/expenseRoutes");
const paymentRoutes = require("./routes/paymentRoutes");
const leaderboardRouter = require("./routes/userLeaderBoard");
const passwordRoutes = require("./routes/passwordRoutes");
const reportRoutes = require("./routes/reportRoutes");

const app = express();

//LOGGING SETUP

// create logs directory if not exists
const logDirectory = path.join(__dirname, "logs");
if (!fs.existsSync(logDirectory)) {
  fs.mkdirSync(logDirectory);
}

// request logs
const accessLogStream = fs.createWriteStream(
  path.join(logDirectory, "access.log"),
  { flags: "a" }
);

// morgan middleware
app.use(morgan("combined", { stream: accessLogStream }));

// console logs only in development
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

//MIDDLEWARES

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static frontend
app.use(express.static(path.join(__dirname, "Frontend")));

// Default route
app.get("/", (req, res) => {  
  res.sendFile(
    path.join(__dirname, "Frontend", "login", "login.html")
  );
});


//ROUTES

app.use("/users", userRouter);
app.use("/expenses", expenseRouter);
app.use("/expenses", leaderboardRouter);
app.use("/payment", paymentRoutes);
app.use("/password", passwordRoutes);
app.use("/reports", reportRoutes);

//ERROR HANDLER (LAST)

app.use((err, req, res, next) => {
  const errorLog = `
[${new Date().toISOString()}]
METHOD: ${req.method}
URL: ${req.originalUrl}
STATUS: ${err.statusCode || 500}
MESSAGE: ${err.message}
STACK: ${err.stack}
----------------------------------
`;

  fs.appendFileSync(
    path.join(logDirectory, "error.log"),
    errorLog
  );

  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
});


//SERVER START
connectDB();

app.listen(process.env.PORT || 3000, () => {
  console.log("Server is running");
});





