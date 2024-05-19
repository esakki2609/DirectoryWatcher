import express from "express";
import bodyParser from "body-parser";
const app = express();
app.use(bodyParser.json());

// Import routes
import configRoutes from "./routes/configRoutes.js";
import taskRoutes from "./routes/taskRoutes.js";

// Use routes
app.use("/dir", configRoutes);
app.use("/task", taskRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
