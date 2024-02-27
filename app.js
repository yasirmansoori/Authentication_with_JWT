// Dependencies
const express = require('express');
const db = require("./src/db/db");
const cors = require('cors');
const userRoute = require('./src/routes/user.route');
const adminRoute = require('./src/routes/admin.route');
const { notFoundMiddleware, defaultErrorHandler } = require('./src/middlewares/error');
const auth = require('./src/middlewares/auth');
const protect = require('./src/middlewares/protect');
const cookieParser = require('cookie-parser');

// Environment variables
const PORT = process.env.PORT || 3001;
const CONNECTION_STRING = `${process.env.MONGODB_URI}/${process.env.DATABASE_NAME}`

// Connect the database
db.connect(CONNECTION_STRING)
  .then(() => {
    console.log("Database connected.");
  })
  .catch((err) => {
    console.log(err.message);
  });

// configure
const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Routes
app.get('/', (req, res) => {
  res.status(200).json({ message: "Server is running...." });
});

// Protected route
app.get('/protected', protect, async (req, res, next) => {
  res.status(200).json({ message: "This is a protected route" });
})

// admin routes
app.use("/api/admin/", protect, auth, adminRoute);

// user routes
app.use("/api/user/", userRoute);

// 404 Not Found middleware
app.use(notFoundMiddleware);

// Error Handling Middleware
app.use(defaultErrorHandler);

app.listen(PORT, () => {
  console.log(`Server is listening on http://localhost:${PORT}`);
});