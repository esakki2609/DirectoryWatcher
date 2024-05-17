const express = require("express");
const bodyParser = require("body-parser");
const app = express();
app.use(bodyParser.json());

// Import routes
const configRoutes = require("./routes/configRoutes");
const taskRoutes = require("./routes/taskRoutes");

// Use routes
app.use("/dir", configRoutes);
app.use("/task", taskRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
